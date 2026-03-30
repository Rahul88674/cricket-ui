import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CricketService } from '../../services/cricket.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  credentials = {
    email: '',
    password: ''
  };

  error = '';
  loading = false;
  showPassword = false;

  constructor(
    private cricketService: CricketService,
    private router: Router
  ) {
    // Redirect if already logged in
    if (this.cricketService.isLoggedIn()) {
      this.router.navigate(['/admin']);
    }
  }

  login() {
    if (!this.credentials.email || !this.credentials.password) {
      this.error = '⚠️ Please fill all fields!';
      return;
    }

    this.loading = true;
    this.error = '';

    this.cricketService.login(this.credentials).subscribe({
      next: (data) => {
        this.cricketService.saveToken(data.token, data.admin);
        this.router.navigate(['/admin']);
        this.loading = false;
      },
      error: (err) => {
        this.error = '❌ Invalid email or password!';
        this.loading = false;
      }
    });
  }
}