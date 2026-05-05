import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import Pusher from 'pusher-js';

@Injectable({
  providedIn: 'root'
})
export class CricketService {

  private apiUrl     = 'https://cricket-api-1tdp.onrender.com/api';
  private pusher: Pusher;
  private channels: { [key: number]: any } = {};

  constructor(private http: HttpClient) {
    // Initialize Pusher
    this.pusher = new Pusher('1f060d893b86b7e16274', {
      cluster: 'ap2'
    });
  }

  // ========== PUSHER ==========

  joinMatch(matchId: number) {
    if (!this.channels[matchId]) {
      this.channels[matchId] = this.pusher.subscribe('match-' + matchId);
      console.log('✅ Subscribed to match channel:', matchId);
    }
    return this.channels[matchId];
  }

  onScoreUpdate(): Observable<any> {
    return new Observable(observer => {
      this.pusher.bind_global((event: string, data: any) => {
        if (event === 'score-updated') {
          observer.next(data);
        }
      });
    });
  }

  onConnect(): Observable<any> {
    return new Observable(observer => {
      this.pusher.connection.bind('connected', () => {
        console.log('✅ Pusher connected!');
        observer.next(true);
      });
      // If already connected
      if (this.pusher.connection.state === 'connected') {
        observer.next(true);
      }
    });
  }

  onInningsSwitch(): Observable<any> {
    return new Observable(observer => {
      this.pusher.bind_global((event: string, data: any) => {
        if (event === 'innings-switched') {
          observer.next(data);
        }
      });
    });
  }

  // ========== AUTH ==========

  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, data);
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout`, {});
  }

  saveToken(token: string, admin: any) {
    localStorage.setItem('cricket_token', token);
    localStorage.setItem('cricket_admin', JSON.stringify(admin));
  }

  getToken(): string | null {
    return localStorage.getItem('cricket_token');
  }

  getAdmin(): any {
    const admin = localStorage.getItem('cricket_admin');
    return admin ? JSON.parse(admin) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  clearAuth() {
    localStorage.removeItem('cricket_token');
    localStorage.removeItem('cricket_admin');
  }

  // ========== API CALLS ==========

  getMatches(): Observable<any> {
    return this.http.get(`${this.apiUrl}/matches`);
  }

  getMatch(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/matches/${id}`);
  }

  createMatch(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/matches`, data);
  }

  updateScore(matchId: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/scores/${matchId}`, data);
  }

  getScore(matchId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/scores/${matchId}`);
  }

  updateStatus(matchId: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/matches/${matchId}/status`, { status });
  }

  getBallByBall(matchId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/balls/${matchId}`);
  }

  switchInnings(matchId: number, battingTeam: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/matches/${matchId}/switch-innings`, {
      batting_team: battingTeam
    });
  }

  // ========== PLAYER STATS ==========

  getPlayers(matchId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/matches/${matchId}/players`);
  }

  addPlayer(matchId: number, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/matches/${matchId}/players`, data);
  }

  getScorecard(matchId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/matches/${matchId}/scorecard`);
  }

  startInnings(matchId: number, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/matches/${matchId}/start-innings`, data);
  }

  setBowler(matchId: number, bowlerId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/matches/${matchId}/set-bowler`, {
      bowler_id: bowlerId
    });
  }

  setNewBatsman(matchId: number, batsmanId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/matches/${matchId}/set-batsman`, {
      batsman_id: batsmanId
    });
  }

  swapBatsmen(matchId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/matches/${matchId}/swap-batsmen`, {});
  }
}