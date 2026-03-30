// // import { Component } from '@angular/core';

// // @Component({
// //   selector: 'app-user',
// //   imports: [],
// //   templateUrl: './user.component.html',
// //   styleUrl: './user.component.css'
// // })
// // export class UserComponent {

// // }
// // import { Component, OnInit, OnDestroy } from '@angular/core';
// // import { CommonModule } from '@angular/common';
// // import { CricketService } from '../../services/cricket.service';
// // import { Subscription } from 'rxjs';

// // @Component({
// //   selector: 'app-user',
// //   standalone: true,
// //   imports: [CommonModule],
// //   templateUrl: './user.component.html',
// //   styleUrls: ['./user.component.css']
// // })
// // export class UserComponent implements OnInit, OnDestroy {

// //   matches: any[] = [];
// //   selectedMatch: any = null;
// //   liveScore: any = null;
// //   isConnected = false;
// //   lastUpdated = '';
// //   private scoreSubscription: Subscription | null = null;

// //   constructor(private cricketService: CricketService) {}

// //   ngOnInit() {
// //     this.loadMatches();

// //     // Listen for socket connection
// //     this.cricketService.onConnect().subscribe(() => {
// //       this.isConnected = true;
// //     });

// //     // Listen for live score updates
// //     this.scoreSubscription = this.cricketService.onScoreUpdate().subscribe((data) => {
// //       this.liveScore = data;
// //       this.lastUpdated = new Date().toLocaleTimeString();
// //     });
// //   }

// //   loadMatches() {
// //     this.cricketService.getMatches().subscribe({
// //       next: (data) => {
// //         this.matches = data;
// //         // Auto select live match if any
// //         const liveMatch = data.find((m: any) => m.status === 'live');
// //         if (liveMatch) {
// //           this.selectMatch(liveMatch);
// //         }
// //       }
// //     });
// //   }

// //   selectMatch(match: any) {
// //     this.selectedMatch = match;
// //     this.liveScore = match.score;

// //     // Join socket room for this match
// //     this.cricketService.joinMatch(match.id);
// //   }

// //   getOversBowled(): string {
// //     if (!this.liveScore) return '0.0';
// //     return this.liveScore.overs;
// //   }

// //   getRunRate(): string {
// //     if (!this.liveScore || this.liveScore.overs === 0) return '0.00';
// //     const rr = this.liveScore.runs / this.liveScore.overs;
// //     return rr.toFixed(2);
// //   }

// //   ngOnDestroy() {
// //     if (this.scoreSubscription) {
// //       this.scoreSubscription.unsubscribe();
// //     }
// //   }
// // }

// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { CricketService } from '../../services/cricket.service';
// import { Subscription } from 'rxjs';

// @Component({
//   selector: 'app-user',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './user.component.html',
//   styleUrls: ['./user.component.css']
// })
// export class UserComponent implements OnInit, OnDestroy {

//   matches: any[] = [];
//   selectedMatch: any = null;
//   liveScore: any = null;
//   ballHistory: any[] = [];
//   isConnected = false;
//   lastUpdated = '';
//   animateScore = false;
//   private scoreSubscription: Subscription | null = null;

//   constructor(private cricketService: CricketService) {}

//   ngOnInit() {
//     this.loadMatches();

//     this.cricketService.onConnect().subscribe(() => {
//       this.isConnected = true;
//     });

//     this.scoreSubscription = this.cricketService.onScoreUpdate().subscribe((data) => {
//       this.triggerScoreAnimation();
//       this.liveScore = data;
//       this.lastUpdated = new Date().toLocaleTimeString();
//       if (this.selectedMatch) {
//         this.loadBallHistory(this.selectedMatch.id);
//       }
//     });
//   }

//   loadMatches() {
//     this.cricketService.getMatches().subscribe({
//       next: (data) => {
//         this.matches = data;
//         const liveMatch = data.find((m: any) => m.status === 'live');
//         if (liveMatch) {
//           this.selectMatch(liveMatch);
//         }
//       }
//     });
//   }

//   selectMatch(match: any) {
//     this.selectedMatch = match;
//     this.liveScore = match.score;
//     this.cricketService.joinMatch(match.id);
//     this.loadBallHistory(match.id);
//   }

//   loadBallHistory(matchId: number) {
//     this.cricketService.getBallByBall(matchId).subscribe({
//       next: (data) => { this.ballHistory = data; }
//     });
//   }

//   triggerScoreAnimation() {
//     this.animateScore = true;
//     setTimeout(() => { this.animateScore = false; }, 600);
//   }

//   getRunRate(): string {
//     if (!this.liveScore || this.liveScore.overs === 0) return '0.00';
//     return (this.liveScore.runs / this.liveScore.overs).toFixed(2);
//   }

//   getWicketsLeft(): number {
//     if (!this.liveScore) return 10;
//     return 10 - this.liveScore.wickets;
//   }

//   getBallLabel(ball: any): string {
//     if (ball.is_six) return '6';
//     if (ball.is_four) return '4';
//     if (ball.is_wicket) return 'W';
//     return ball.runs_scored.toString();
//   }

//   getBallClass(ball: any): string {
//     if (ball.is_wicket) return 'ball-wicket';
//     if (ball.is_six) return 'ball-six';
//     if (ball.is_four) return 'ball-four';
//     return 'ball-normal';
//   }

//   ngOnDestroy() {
//     if (this.scoreSubscription) {
//       this.scoreSubscription.unsubscribe();
//     }
//   }
// }

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CricketService } from '../../services/cricket.service';
import { Subscription } from 'rxjs';
import { ScorecardComponent } from '../scorecard/scorecard.component';

@Component({
  selector: 'app-user',
  standalone: true,
  // imports: [CommonModule],
  imports: [CommonModule, ScorecardComponent],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit, OnDestroy {

  matches: any[] = [];
  selectedMatch: any = null;
  liveScore: any = null;
  ballHistory: any[] = [];
  isConnected = false;
  lastUpdated = '';
  animateScore = false;

  currentStriker: any    = null;
  currentNonStriker: any = null;
  currentBowler: any     = null;
  matchWinner            = '';
  overJustCompleted      = false;

  private scoreSubscription: Subscription | null = null;
  private inningsSubscription: Subscription | null = null;
  

  constructor(private cricketService: CricketService) {}

  ngOnInit() {
    this.loadMatches();

    this.cricketService.onConnect().subscribe(() => {
      this.isConnected = true;
    });

    // Listen for score updates
    // this.scoreSubscription = this.cricketService.onScoreUpdate().subscribe((data) => {
    //   this.triggerScoreAnimation();
    //   this.liveScore = data;
    //   this.lastUpdated = new Date().toLocaleTimeString();
    //   if (this.selectedMatch) {
    //     this.loadBallHistory(this.selectedMatch.id);
    //     // Refresh match for innings info
    //     this.refreshMatch(this.selectedMatch.id);
    //   }
    // });
    this.scoreSubscription = this.cricketService.onScoreUpdate().subscribe((data) => {
      this.triggerScoreAnimation();
      this.liveScore   = data;
      this.lastUpdated = new Date().toLocaleTimeString();

      // Update current players from socket
      if (data.current_striker)    this.currentStriker    = data.current_striker;
      if (data.current_nonstriker) this.currentNonStriker = data.current_nonstriker;
      if (data.current_bowler)     this.currentBowler     = data.current_bowler;

      // Check winner
      if (data.match_status === 'completed') {
        this.matchWinner = data.batting_team;
      }

      // Over completed
      if (data.over_completed) {
        this.overJustCompleted = true;
        setTimeout(() => { this.overJustCompleted = false; }, 5000);
      }

      if (this.selectedMatch) {
        this.loadBallHistory(this.selectedMatch.id);
        this.refreshMatch(this.selectedMatch.id);
      }
    });

    // Listen for innings switch
    this.inningsSubscription = this.cricketService.onInningsSwitch().subscribe((data) => {
      this.selectedMatch = { ...this.selectedMatch, ...data };
      this.liveScore = {
        runs: 0,
        wickets: 0,
        overs: 0.0,
        batting_team: data.score?.batting_team || '',
        last_action: '2nd Innings started!'
      };
      this.lastUpdated = new Date().toLocaleTimeString();
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

  refreshMatch(matchId: number) {
    this.cricketService.getMatch(matchId).subscribe({
      next: (data) => {
        this.selectedMatch = data;
        // Update match in list
        const idx = this.matches.findIndex(m => m.id === matchId);
        if (idx !== -1) this.matches[idx] = data;
      }
    });
  }

  // selectMatch(match: any) {
  //   this.selectedMatch = match;
  //   this.liveScore     = match.score;
  //   this.cricketService.joinMatch(match.id);
  //   this.loadBallHistory(match.id);
  // }
  selectMatch(match: any) {
    this.selectedMatch = match;
    this.liveScore     = match.score;
    this.cricketService.joinMatch(match.id);
    this.loadBallHistory(match.id);
    this.loadCurrentPlayers(match.id);
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
    const totalOvers = 20; // T20 format
    const oversLeft  = totalOvers - this.liveScore.overs;
    if (oversLeft <= 0 || runsNeeded <= 0) return '0.00';
    return (runsNeeded / oversLeft).toFixed(2);
  }

  getRunsNeeded(): number {
    if (!this.selectedMatch?.target || !this.liveScore) return 0;
    return this.selectedMatch.target - this.liveScore.runs;
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

  ngOnDestroy() {
    if (this.scoreSubscription)   this.scoreSubscription.unsubscribe();
    if (this.inningsSubscription) this.inningsSubscription.unsubscribe();
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
}