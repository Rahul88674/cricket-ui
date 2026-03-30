import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CricketService } from '../../services/cricket.service';

@Component({
  selector: 'app-scorecard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './scorecard.component.html',
  styleUrls: ['./scorecard.component.css']
})
export class ScorecardComponent implements OnInit, OnChanges {

  @Input() matchId!: number;
  @Input() isAdmin: boolean = false;
  @Input() match: any = null;
  @Output() bowlerChanged  = new EventEmitter<void>();
@Output() batsmanChanged = new EventEmitter<void>();

  players: any[]    = [];
  batting: any[]    = [];
  bowling: any[]    = [];
  activeTab: string = 'batting';

  // Scorecard data
  currentStriker: any    = null;
  currentNonStriker: any = null;
  currentBowler: any     = null;

  // Add player form
  newPlayer = { name: '', team: '', role: 'batsman' };
  showAddPlayer = false;

  // Start innings form
  showStartInnings  = false;
  selectedStriker   = 0;
  selectedNonStriker = 0;
  selectedBowler    = 0;

  // Wicket form
  showWicketForm  = false;
  newBatsmanId    = 0;

  // New bowler form
  showNewBowler = false;
  newBowlerId   = 0;

  message     = '';
  messageType = '';
  loading     = false;

  constructor(private cricketService: CricketService) {}

  ngOnInit() {
    if (this.matchId) {
      this.loadPlayers();
      this.loadScorecard();
    }
  }

  ngOnChanges() {
    if (this.matchId) {
      this.loadPlayers();
      this.loadScorecard();
    }
  }

  loadPlayers() {
    this.cricketService.getPlayers(this.matchId).subscribe({
      next: (data) => { this.players = data; }
    });
  }

  loadScorecard() {
    this.cricketService.getScorecard(this.matchId).subscribe({
      next: (data) => {
        this.batting          = data.batting;
        this.bowling          = data.bowling;
        this.currentStriker   = data.current_striker;
        this.currentNonStriker = data.current_nonstriker;
        this.currentBowler    = data.current_bowler;
      }
    });
  }

  addPlayer() {
    if (!this.newPlayer.name || !this.newPlayer.team) {
      this.showMessage('⚠️ Fill all fields!', 'warning');
      return;
    }
    this.loading = true;
    this.cricketService.addPlayer(this.matchId, this.newPlayer).subscribe({
      next: () => {
        this.showMessage('✅ Player added!', 'success');
        this.newPlayer    = { name: '', team: '', role: 'batsman' };
        this.showAddPlayer = false;
        this.loadPlayers();
        this.loading = false;
      },
      error: () => {
        this.showMessage('❌ Error adding player!', 'error');
        this.loading = false;
      }
    });
  }

  startInnings() {
    if (!this.selectedStriker || !this.selectedNonStriker || !this.selectedBowler) {
      this.showMessage('⚠️ Select all players!', 'warning');
      return;
    }
    this.loading = true;
    this.cricketService.startInnings(this.matchId, {
      striker_id:    this.selectedStriker,
      nonstriker_id: this.selectedNonStriker,
      bowler_id:     this.selectedBowler,
    }).subscribe({
      next: () => {
        this.showMessage('✅ Innings started!', 'success');
        this.showStartInnings = false;
        this.loadScorecard();
        this.loading = false;
      },
      error: () => {
        this.showMessage('❌ Error!', 'error');
        this.loading = false;
      }
    });
  }

  setNewBatsman() {
    if (!this.newBatsmanId) {
      this.showMessage('⚠️ Select batsman!', 'warning');
      return;
    }
    this.loading = true;
    this.cricketService.setNewBatsman(this.matchId, this.newBatsmanId).subscribe({
      next: () => {
        this.showMessage('✅ New batsman set!', 'success');
        this.showWicketForm = false;
        this.newBatsmanId   = 0;
        this.loadScorecard();
        this.loading = false;
        this.batsmanChanged.emit();
      },
      error: () => {
        this.showMessage('❌ Error!', 'error');
        this.loading = false;
      }
    });
  }

  setNewBowler() {
    if (!this.newBowlerId) {
      this.showMessage('⚠️ Select bowler!', 'warning');
      return;
    }
    this.loading = true;
    this.cricketService.setBowler(this.matchId, this.newBowlerId).subscribe({
      next: () => {
        this.showMessage('✅ Bowler changed!', 'success');
        this.showNewBowler = false;
        this.newBowlerId   = 0;
        this.loadScorecard();
        this.loading = false;
        this.bowlerChanged.emit();
      },
      error: () => {
        this.showMessage('❌ Error!', 'error');
        this.loading = false;
      }
    });
  }

  getTeam1Players() {
    return this.players.filter(p => p.team === this.match?.team1);
  }

  getTeam2Players() {
    return this.players.filter(p => p.team === this.match?.team2);
  }

  getBattingTeamPlayers() {
    const battingTeam = this.match?.score?.batting_team;
    return this.players.filter(p => p.team === battingTeam);
  }

  getBowlingTeamPlayers() {
    const battingTeam = this.match?.score?.batting_team;
    return this.players.filter(p =>
      p.team !== battingTeam &&
      (p.role === 'bowler' || p.role === 'allrounder')
    );
  }

  getAvailableBatsmen() {
    const battingTeam  = this.match?.score?.batting_team;
    const innings      = this.match?.current_innings;
    const outPlayerIds = this.batting
      .filter(b => b.innings === innings && b.is_out)
      .map(b => b.player_id);
    const battingIds   = this.batting
      .filter(b => b.innings === innings && b.is_batting)
      .map(b => b.player_id);

    return this.players.filter(p =>
      p.team === battingTeam &&
      !outPlayerIds.includes(p.id) &&
      !battingIds.includes(p.id)
    );
  }

  getBattingByInnings(innings: number) {
    return this.batting.filter(b => b.innings === innings);
  }

  getBowlingByInnings(innings: number) {
    return this.bowling.filter(b => b.innings === innings);
  }

  getStrikeRate(runs: number, balls: number): string {
    if (balls === 0) return '-';
    return ((runs / balls) * 100).toFixed(1);
  }

  getEconomy(runs: number, overs: number): string {
    if (overs === 0) return '-';
    return (runs / overs).toFixed(2);
  }

  showMessage(msg: string, type: string) {
    this.message     = msg;
    this.messageType = type;
    setTimeout(() => { this.message = ''; }, 3000);
  }

  refresh() {
    this.loadPlayers();
    this.loadScorecard();
  }
}