import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CricketService } from '../../services/cricket.service';
import { ScorecardComponent } from '../scorecard/scorecard.component';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, ScorecardComponent],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit, OnDestroy {

  matches: any[]         = [];
  selectedMatch: any     = null;
  liveScore: any         = null;
  ballHistory: any       = {};
  isConnected            = false;
  lastUpdated            = '';
  animateScore           = false;
  currentStriker: any    = null;
  currentNonStriker: any = null;
  currentBowler: any     = null;
  matchWinner            = '';
  overJustCompleted      = false;

  constructor(private cricketService: CricketService) {}

  ngOnInit() {
    this.loadMatches();

    // Pusher connection status
    this.cricketService.onConnect().subscribe(() => {
      this.isConnected = true;
      console.log('✅ Pusher connected!');
    });
  }

  loadMatches() {
    this.cricketService.getMatches().subscribe({
      next: (data) => {
        this.matches = data;
        const liveMatch = data.find((m: any) => m.status === 'live');
        if (liveMatch) {
          this.selectMatch(liveMatch);
        }
      }
    });
  }

  selectMatch(match: any) {
    this.selectedMatch = match;
    this.liveScore     = match.score;

    // Subscribe to Pusher channel for this match
    const channel = this.cricketService.joinMatch(match.id);

    // Listen for score updates on this specific channel
    channel.bind('score-updated', (data: any) => {
      this.triggerScoreAnimation();
      this.liveScore   = data;
      this.lastUpdated = new Date().toLocaleTimeString();

      if (data.current_striker)    this.currentStriker    = data.current_striker;
      if (data.current_nonstriker) this.currentNonStriker = data.current_nonstriker;
      if (data.current_bowler)     this.currentBowler     = data.current_bowler;

      if (data.match_status === 'completed') {
        this.matchWinner = data.batting_team;
      }

      if (data.over_completed) {
        this.overJustCompleted = true;
        setTimeout(() => { this.overJustCompleted = false; }, 5000);
      }

      this.loadBallHistory(match.id);
      this.refreshMatch(match.id);
    });

    this.loadBallHistory(match.id);
    this.loadCurrentPlayers(match.id);
  }

  refreshMatch(matchId: number) {
    this.cricketService.getMatch(matchId).subscribe({
      next: (data) => {
        this.selectedMatch = data;
        const idx = this.matches.findIndex(m => m.id === matchId);
        if (idx !== -1) this.matches[idx] = data;
      }
    });
  }

  loadCurrentPlayers(matchId: number) {
    this.cricketService.getScorecard(matchId).subscribe({
      next: (data) => {
        this.currentStriker    = data.current_striker;
        this.currentNonStriker = data.current_nonstriker;
        this.currentBowler     = data.current_bowler;
      }
    });
  }

  loadBallHistory(matchId: number) {
    this.cricketService.getBallByBall(matchId).subscribe({
      next: (data) => { this.ballHistory = data; }
    });
  }

  triggerScoreAnimation() {
    this.animateScore = true;
    setTimeout(() => { this.animateScore = false; }, 600);
  }

  getRunRate(): string {
    if (!this.liveScore || this.liveScore.overs === 0) return '0.00';
    return (this.liveScore.runs / this.liveScore.overs).toFixed(2);
  }

  getRequiredRunRate(): string {
    if (!this.selectedMatch?.target || !this.liveScore) return '0.00';
    const runsNeeded = this.selectedMatch.target - this.liveScore.runs;
    const totalOvers = this.selectedMatch.total_overs || 20;
    const oversLeft  = totalOvers - this.liveScore.overs;
    if (oversLeft <= 0 || runsNeeded <= 0) return '0.00';
    return (runsNeeded / oversLeft).toFixed(2);
  }

  getRunsNeeded(): number {
    if (!this.selectedMatch?.target || !this.liveScore) return 0;
    return this.selectedMatch.target - this.liveScore.runs;
  }

  getBallsLeft(): number {
    if (!this.selectedMatch || !this.liveScore) return 0;
    const totalOvers     = this.selectedMatch.total_overs || 20;
    const oversStr       = this.liveScore.overs.toString().split('.');
    const completedOvers = parseInt(oversStr[0]) || 0;
    const completedBalls = parseInt(oversStr[1]) || 0;
    const ballsBowled    = (completedOvers * 6) + completedBalls;
    const totalBalls     = totalOvers * 6;
    return totalBalls - ballsBowled;
  }

  getWicketsLeft(): number {
    if (!this.liveScore) return 10;
    return 10 - this.liveScore.wickets;
  }

  isSecondInnings(): boolean {
    return this.selectedMatch?.current_innings === 2;
  }

  getBallLabel(ball: any): string {
    if (ball.is_six)    return '6';
    if (ball.is_four)   return '4';
    if (ball.is_wicket) return 'W';
    return ball.runs_scored.toString();
  }

  getBallClass(ball: any): string {
    if (ball.is_wicket) return 'ball-wicket';
    if (ball.is_six)    return 'ball-six';
    if (ball.is_four)   return 'ball-four';
    return 'ball-normal';
  }

  getStrikeRate(runs: number, balls: number): string {
    if (!balls) return '-';
    return ((runs / balls) * 100).toFixed(1);
  }

  getEconomy(runs: number, overs: number): string {
    if (!overs) return '-';
    return (runs / overs).toFixed(2);
  }

  getOvers(): any[] {
    if (!this.ballHistory) return [];
    const overs: any[] = [];
    Object.keys(this.ballHistory).forEach(overNum => {
      const balls = this.ballHistory[overNum as any];
      const total = balls.reduce((sum: number, b: any) => sum + b.runs_scored, 0);
      overs.push({ over: parseInt(overNum) + 1, balls, total });
    });
    return overs;
  }

  ngOnDestroy() {}
}