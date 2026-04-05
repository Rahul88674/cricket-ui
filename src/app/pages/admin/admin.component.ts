// import { Component, OnInit, ViewChild } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { CricketService } from '../../services/cricket.service';
// import { ScorecardComponent } from '../scorecard/scorecard.component';

// @Component({
//   selector: 'app-admin',
//   standalone: true,
//   imports: [CommonModule, FormsModule, ScorecardComponent],
//   templateUrl: './admin.component.html',
//   styleUrls: ['./admin.component.css']
// })
// export class AdminComponent implements OnInit {

//   matches: any[]      = [];
//   selectedMatch: any  = null;

//   newMatch = { team1: '', team2: '', venue: '' };

//   scoreData = {
//     runs: 0, wickets: 0, overs: 0.0,
//     batting_team: '', last_action: ''
//   };

//   currentOver = 0;
//   currentBall = 0;
//   ballHistory: any[] = [];

//   // Innings
//   showInningsSwitchConfirm  = false;
//   secondInningsBattingTeam  = '';

//   // Over completed
//   overCompleted     = false;

//   // Wicket fell
//   wicketFell        = false;

//   message     = '';
//   messageType = '';
//   loading     = false;

//   // scorecardRef: any;
//   @ViewChild('scorecardComp') scorecardRef: any;

//   constructor(private cricketService: CricketService, private router: Router) {}

//   ngOnInit() { this.loadMatches(); }

//   loadMatches() {
//     this.cricketService.getMatches().subscribe({
//       next: (data) => { this.matches = data; },
//       error: () => { this.showMessage('❌ Error loading matches!', 'error'); }
//     });
//   }

//   createMatch() {
//     if (!this.newMatch.team1 || !this.newMatch.team2 || !this.newMatch.venue) {
//       this.showMessage('⚠️ Please fill all fields!', 'warning');
//       return;
//     }
//     this.loading = true;
//     this.cricketService.createMatch(this.newMatch).subscribe({
//       next: () => {
//         this.showMessage('✅ Match created!', 'success');
//         this.newMatch = { team1: '', team2: '', venue: '' };
//         this.loadMatches();
//         this.loading = false;
//       },
//       error: () => {
//         this.showMessage('❌ Error creating match!', 'error');
//         this.loading = false;
//       }
//     });
//   }

//   selectMatch(match: any) {
//     this.selectedMatch            = match;
//     this.scoreData.batting_team   = match.team1;
//     this.showInningsSwitchConfirm = false;
//     this.overCompleted            = false;
//     this.wicketFell               = false;

//     if (match.score) {
//       this.scoreData.runs         = match.score.runs;
//       this.scoreData.wickets      = match.score.wickets;
//       this.scoreData.overs        = match.score.overs;
//       this.scoreData.batting_team = match.score.batting_team;

//       const parts      = match.score.overs.toString().split('.');
//       this.currentOver = parseInt(parts[0]) || 0;
//       this.currentBall = parseInt(parts[1]) || 0;
//     }

//     this.secondInningsBattingTeam = match.team2;
//     this.loadBallHistory(match.id);
//     this.message = '';
//   }

//   // loadBallHistory(matchId: number) {
//   //   this.cricketService.getBallByBall(matchId).subscribe({
//   //     next: (data) => { this.ballHistory = data; }
//   //   });
//   // }

//   loadBallHistory(matchId: number) {
//     this.cricketService.getBallByBall(matchId).subscribe({
//       next: (data) => {
//         this.ballHistory = data;
//       }
//     });
//   }

//   recordAndUpdate(
//     runs: number,
//     isWicket = false,
//     isFour   = false,
//     isSix    = false,
//     actionText = ''
//   ) {
//     // Block if over completed and bowler not selected
//     if (this.overCompleted) {
//       this.showMessage('⚠️ Please select new bowler first!', 'warning');
//       return;
//     }

//     // Block if wicket fell and new batsman not selected
//     if (this.wicketFell) {
//       this.showMessage('⚠️ Please select new batsman first!', 'warning');
//       return;
//     }

//     this.currentBall++;

//     if (this.currentBall > 6) {
//       this.currentBall = 1;
//       this.currentOver++;
//     }

//     this.scoreData.runs += runs;

//     if (isWicket) {
//       this.scoreData.wickets = Math.min(this.scoreData.wickets + 1, 10);
//     }

//     const completedOvers = this.currentBall === 6 ? this.currentOver + 1 : this.currentOver;
//     const ballsInOver    = this.currentBall === 6 ? 0 : this.currentBall;

//     this.scoreData.overs       = parseFloat(`${completedOvers}.${ballsInOver}`);
//     this.scoreData.last_action = actionText || `${runs} run(s)`;

//     this.submitScore(runs, isWicket, isFour, isSix);
//   }

//   submitScore(runsScored = 0, isWicket = false, isFour = false, isSix = false) {
//     if (!this.selectedMatch) return;
//     this.loading = true;

//     const payload = {
//       ...this.scoreData,
//       ball: {
//         over_number: this.currentOver,
//         ball_number: this.currentBall,
//         runs_scored: runsScored,
//         is_wicket:   isWicket,
//         is_four:     isFour,
//         is_six:      isSix,
//       }
//     };

//     this.cricketService.updateScore(this.selectedMatch.id, payload).subscribe({
//       next: (data) => {
//         // Check if match completed
//         if (data.match_completed) {
//           this.showMessage('🏆 Match completed! ' + data.winner + ' won!', 'success');
//           this.loadMatches();
//           this.loading = false;
//           return;
//         }

//         // Check if over completed
//         if (data.over_completed) {
//           this.overCompleted = true;
//           this.showMessage('✅ Over completed! Select new bowler!', 'warning');
//         } else {
//           this.showMessage('✅ Score updated!', 'success');
//         }

//         // Check if wicket fell
//         if (isWicket && this.scoreData.wickets < 10) {
//           this.wicketFell = true;
//           this.showMessage('🎯 Wicket! Select new batsman!', 'warning');
//         }

//         this.loadMatches();
//         this.loadBallHistory(this.selectedMatch.id);

//         // Refresh scorecard
//         if (this.scorecardRef) {
//           this.scorecardRef.refresh();
//         }

//         this.loading = false;
//       },
//       error: () => {
//         this.showMessage('❌ Error updating score!', 'error');
//         this.loading = false;
//       }
//     });
//   }

//   onBowlerChanged() {
//     this.overCompleted = false;
//     this.showMessage('✅ New bowler set! Continue scoring!', 'success');
//     if (this.scorecardRef) this.scorecardRef.refresh();
//   }

//   onBatsmanChanged() {
//     this.wicketFell = false;
//     this.showMessage('✅ New batsman set! Continue scoring!', 'success');
//     if (this.scorecardRef) this.scorecardRef.refresh();
//   }

//   updateStatus(matchId: number, status: string) {
//     this.cricketService.updateStatus(matchId, status).subscribe({
//       next: () => {
//         this.showMessage(`✅ Status updated to ${status}!`, 'success');
//         this.loadMatches();
//       }
//     });
//   }

//   confirmSwitchInnings() { this.showInningsSwitchConfirm = true; }

//   switchInnings() {
//     if (!this.selectedMatch) return;
//     this.loading = true;

//     this.cricketService.switchInnings(
//       this.selectedMatch.id,
//       this.secondInningsBattingTeam
//     ).subscribe({
//       next: (data) => {
//         this.showMessage(`🏏 2nd Innings started! Target: ${data.target}`, 'success');
//         this.showInningsSwitchConfirm = false;
//         this.overCompleted            = false;
//         this.wicketFell               = false;
//         this.currentOver              = 0;
//         this.currentBall              = 0;
//         this.scoreData = {
//           runs: 0, wickets: 0, overs: 0.0,
//           batting_team: this.secondInningsBattingTeam,
//           last_action:  '2nd Innings started!'
//         };
//         this.loadMatches();
//         this.loading = false;
//       },
//       error: () => {
//         this.showMessage('❌ Error switching innings!', 'error');
//         this.loading = false;
//       }
//     });
//   }

//   showMessage(msg: string, type: string) {
//     this.message     = msg;
//     this.messageType = type;
//     setTimeout(() => { this.message = ''; }, 4000);
//   }

//   getAdminName(): string {
//     const admin = this.cricketService.getAdmin();
//     return admin ? admin.name : 'Admin';
//   }

//   logout() {
//     this.cricketService.logout().subscribe({
//       next: () => {
//         this.cricketService.clearAuth();
//         this.router.navigate(['/login']);
//       },
//       error: () => {
//         this.cricketService.clearAuth();
//         this.router.navigate(['/login']);
//       }
//     });
//   }

//   getBallLabel(ball: any): string {
//   if (ball.is_six)    return '6';
//   if (ball.is_four)   return '4';
//   if (ball.is_wicket) return 'W';
//   return ball.runs_scored.toString();
// }

// getBallClass(ball: any): string {
//   if (ball.is_wicket) return 'ball-wicket';
//   if (ball.is_six)    return 'ball-six';
//   if (ball.is_four)   return 'ball-four';
//   return 'ball-normal';
// }

// getOvers(): any[] {
//   if (!this.ballHistory) return [];
//   const overs: any[] = [];
//   Object.keys(this.ballHistory).forEach(overNum => {
//     const balls = this.ballHistory[overNum as any];
//     const total = balls.reduce((sum: number, b: any) => sum + b.runs_scored, 0);
//     overs.push({ over: parseInt(overNum) + 1, balls, total });
//   });
//   return overs;
// }
// }
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CricketService } from '../../services/cricket.service';
import { ScorecardComponent } from '../scorecard/scorecard.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ScorecardComponent],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  matches: any[]     = [];
  selectedMatch: any = null;

  newMatch = {
    team1:       '',
    team2:       '',
    venue:       '',
    total_overs: 20,
    toss_winner: '',
    toss_choice: 'bat'
  };

  scoreData = {
    runs: 0, wickets: 0, overs: 0.0,
    batting_team: '', last_action: ''
  };

  currentOver = 0;
  currentBall = 0;
  ballHistory: any = {};

  // Innings
  showInningsSwitchConfirm = false;
  secondInningsBattingTeam = '';
  inningsCompleted         = false;

  // Over + Wicket flags
  overCompleted = false;
  wicketFell    = false;
  matchDone     = false;

  message     = '';
  messageType = '';
  loading     = false;

  @ViewChild('scorecardComp') scorecardRef: any;

  constructor(private cricketService: CricketService, private router: Router) {}

  ngOnInit() { this.loadMatches(); }

  loadMatches() {
    // this.cricketService.getMatches().subscribe({
    //   next: (data) => { this.matches = data; },
    //   error: () => { this.showMessage('❌ Error loading matches!', 'error'); }
    // });
    this.cricketService.getMatch(this.selectedMatch.id).subscribe({
      next: (freshMatch) => {
        this.selectedMatch = freshMatch;
        // Force scorecard to reload
        setTimeout(() => {
          if (this.scorecardRef) {
            this.scorecardRef.currentStriker    = null;
            this.scorecardRef.currentNonStriker = null;
            this.scorecardRef.currentBowler     = null;
            this.scorecardRef.showStartInnings  = false;
            this.scorecardRef.refresh();
          }
        }, 500);
      }
    });
  }

  createMatch() {
    if (!this.newMatch.team1 || !this.newMatch.team2 ||
        !this.newMatch.venue || !this.newMatch.toss_winner) {
      this.showMessage('⚠️ Please fill all fields!', 'warning');
      return;
    }
    this.loading = true;
    this.cricketService.createMatch(this.newMatch).subscribe({
      next: (data) => {
        this.showMessage(
          `✅ Match created! ${data.batting_first} bats first!`, 'success'
        );
        this.newMatch = {
          team1: '', team2: '', venue: '',
          total_overs: 20, toss_winner: '', toss_choice: 'bat'
        };
        this.loadMatches();
        this.loading = false;
      },
      error: () => {
        this.showMessage('❌ Error creating match!', 'error');
        this.loading = false;
      }
    });
  }

  selectMatch(match: any) {
    this.selectedMatch            = match;
    this.showInningsSwitchConfirm = false;
    this.overCompleted            = false;
    this.wicketFell               = false;
    this.inningsCompleted         = false;
    this.matchDone                = match.status === 'completed';

    if (match.score) {
      this.scoreData.runs         = match.score.runs;
      this.scoreData.wickets      = match.score.wickets;
      this.scoreData.overs        = match.score.overs;
      this.scoreData.batting_team = match.score.batting_team;

      const parts      = match.score.overs.toString().split('.');
      this.currentOver = parseInt(parts[0]) || 0;
      this.currentBall = parseInt(parts[1]) || 0;
    }

    this.secondInningsBattingTeam = match.team2;
    this.loadBallHistory(match.id);
    this.message = '';
  }

  loadBallHistory(matchId: number) {
    this.cricketService.getBallByBall(matchId).subscribe({
      next: (data) => { this.ballHistory = data; }
    });
  }

  recordAndUpdate(
    runs: number,
    isWicket = false,
    isFour   = false,
    isSix    = false,
    actionText = ''
  ) {
    if (this.matchDone) {
      this.showMessage('🏆 Match is already completed!', 'error');
      return;
    }
    if (this.overCompleted) {
      this.showMessage('⚠️ Select new bowler first!', 'warning');
      return;
    }
    if (this.wicketFell) {
      this.showMessage('⚠️ Select new batsman first!', 'warning');
      return;
    }
    if (this.inningsCompleted) {
      this.showMessage('⚠️ Please switch to 2nd innings!', 'warning');
      return;
    }

    this.currentBall++;
    if (this.currentBall > 6) {
      this.currentBall = 1;
      this.currentOver++;
    }

    this.scoreData.runs += runs;
    if (isWicket) {
      this.scoreData.wickets = Math.min(this.scoreData.wickets + 1, 10);
    }

    const completedOvers = this.currentBall === 6 ? this.currentOver + 1 : this.currentOver;
    const ballsInOver    = this.currentBall === 6 ? 0 : this.currentBall;

    this.scoreData.overs       = parseFloat(`${completedOvers}.${ballsInOver}`);
    this.scoreData.last_action = actionText || `${runs} run(s)`;

    this.submitScore(runs, isWicket, isFour, isSix);
  }

  submitScore(runsScored = 0, isWicket = false, isFour = false, isSix = false) {
    if (!this.selectedMatch) return;
    this.loading = true;

    const payload = {
      ...this.scoreData,
      ball: {
        over_number: this.currentOver,
        ball_number: this.currentBall,
        runs_scored: runsScored,
        is_wicket:   isWicket,
        is_four:     isFour,
        is_six:      isSix,
      }
    };

    this.cricketService.updateScore(this.selectedMatch.id, payload).subscribe({
      next: (data) => {

        // Match completed
        if (data.match_completed) {
          this.matchDone = true;
          this.showMessage('🏆 ' + data.winner + ' won the match!', 'success');
          this.loadMatches();
          this.loading = false;
          return;
        }

        // Innings completed (all out or overs done)
        if (data.innings_completed) {
          this.inningsCompleted = true;
          if (this.selectedMatch.current_innings == 1) {
            this.showMessage(
              '🏏 1st Innings done! Switch to 2nd innings!', 'warning'
            );
          } else {
            this.matchDone = true;
            this.showMessage('🏆 Match completed!', 'success');
          }
          this.loadMatches();
          this.loading = false;
          return;
        }

        // Over completed
        if (data.over_completed) {
          this.overCompleted = true;
          this.showMessage('✅ Over done! Select new bowler!', 'warning');
        } else {
          this.showMessage('✅ Score updated!', 'success');
        }

        // Wicket fell
        if (isWicket && this.scoreData.wickets < 10) {
          this.wicketFell = true;
          this.showMessage('🎯 Wicket! Select new batsman!', 'warning');
        }

        this.loadMatches();
        this.loadBallHistory(this.selectedMatch.id);
        if (this.scorecardRef) this.scorecardRef.refresh();
        this.loading = false;
      },
      error: (err) => {
        if (err.status === 400 && err.error?.blocked) {
          this.matchDone = true;
          this.showMessage('🏆 Match is already completed!', 'error');
        } else {
          this.showMessage('❌ Error updating score!', 'error');
        }
        this.loading = false;
      }
    });
  }

  onBowlerChanged() {
    this.overCompleted = false;
    this.showMessage('✅ New bowler set! Continue!', 'success');
    if (this.scorecardRef) this.scorecardRef.refresh();
  }

  onBatsmanChanged() {
    this.wicketFell = false;
    this.showMessage('✅ New batsman set! Continue!', 'success');
    if (this.scorecardRef) this.scorecardRef.refresh();
  }

  updateStatus(matchId: number, status: string) {
    this.cricketService.updateStatus(matchId, status).subscribe({
      next: () => {
        this.showMessage(`✅ Status updated to ${status}!`, 'success');
        this.loadMatches();
      }
    });
  }

  confirmSwitchInnings() {
    this.showInningsSwitchConfirm = true;
  }

  switchInnings() {
    if (!this.selectedMatch) return;
    this.loading = true;

    this.cricketService.switchInnings(
      this.selectedMatch.id,
      this.secondInningsBattingTeam
    ).subscribe({
      // next: (data) => {
      //   this.showMessage(
      //     `🏏 2nd Innings! Target: ${data.target}`, 'success'
      //   );
      //   this.showInningsSwitchConfirm = false;
      //   this.inningsCompleted         = false;
      //   this.overCompleted            = false;
      //   this.wicketFell               = false;
      //   this.currentOver              = 0;
      //   this.currentBall              = 0;
      //   this.scoreData = {
      //     runs: 0, wickets: 0, overs: 0.0,
      //     batting_team: this.secondInningsBattingTeam,
      //     last_action:  '2nd Innings started!'
      //   };
      //   this.loadMatches();
      //   this.loading = false;
      // },
      next: (data) => {
        this.showMessage(
          `🏏 2nd Innings! Target: ${data.target}`, 'success'
        );
        this.showInningsSwitchConfirm = false;
        this.inningsCompleted         = false;
        this.overCompleted            = false;
        this.wicketFell               = false;
        this.currentOver              = 0;
        this.currentBall              = 0;
        this.scoreData = {
          runs: 0, wickets: 0, overs: 0.0,
          batting_team: this.secondInningsBattingTeam,
          last_action:  '2nd Innings started!'
        };

        // ✅ Refresh selected match with fresh data
        this.loadMatches();
        this.cricketService.getMatch(this.selectedMatch.id).subscribe({
          next: (freshMatch) => {
            this.selectedMatch = freshMatch;
            if (this.scorecardRef) this.scorecardRef.refresh();
          }
        });

        this.loading = false;
      },
      error: () => {
        this.showMessage('❌ Error switching innings!', 'error');
        this.loading = false;
      }
    });
  }

  showMessage(msg: string, type: string) {
    this.message     = msg;
    this.messageType = type;
    setTimeout(() => { this.message = ''; }, 4000);
  }

  getAdminName(): string {
    const admin = this.cricketService.getAdmin();
    return admin ? admin.name : 'Admin';
  }

  getOvers(): any[] {
    if (!this.ballHistory) return [];
    const overs: any[] = [];
    Object.keys(this.ballHistory).forEach(overNum => {
      const balls = this.ballHistory[overNum as any];
      const total = balls.reduce(
        (sum: number, b: any) => sum + b.runs_scored, 0
      );
      overs.push({ over: parseInt(overNum) + 1, balls, total });
    });
    return overs;
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

  logout() {
    this.cricketService.logout().subscribe({
      next: () => {
        this.cricketService.clearAuth();
        this.router.navigate(['/login']);
      },
      error: () => {
        this.cricketService.clearAuth();
        this.router.navigate(['/login']);
      }
    });
  }
}