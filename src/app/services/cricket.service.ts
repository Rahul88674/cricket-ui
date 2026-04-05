import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class CricketService {

  // private apiUrl = 'http://localhost:8000/api';
  private apiUrl = 'https://cricket-api-1tdp.onrender.com/api';
  // private socketUrl = 'http://localhost:3000';
  private socketUrl = 'https://cricket-socket-server.onrender.com';
  private socket: Socket;

  constructor(private http: HttpClient) {
    this.socket = io(this.socketUrl);
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

  // ========== SOCKET CALLS ==========

  joinMatch(matchId: number) {
    this.socket.emit('joinMatch', matchId);
  }

  onScoreUpdate(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('scoreUpdated', (data) => {
        observer.next(data);
      });
    });
  }

  onConnect(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('connect', () => {
        observer.next(this.socket.id);
      });
    });
  } 
  
  onInningsSwitch(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('inningsSwitched', (data) => {
        observer.next(data);
      });
    });
  }
}