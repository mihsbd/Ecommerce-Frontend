import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SocialAuthService } from "angularx-social-login";
import { SocialUser } from "angularx-social-login";
import { BehaviorSubject, from } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GoogleLoginProvider } from "angularx-social-login";
import { UserResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  auth: boolean = false;
  private serverUrl = environment.SERVER_URL;
  private user!: SocialUser | UserResponse;
  authState$ = new BehaviorSubject<boolean>(this.auth);
  userData$ = new BehaviorSubject<SocialUser | UserResponse>(null!);

  constructor(private authService: SocialAuthService,
              private http: HttpClient) {
    authService.authState.subscribe((user) => {
      if (user !== null) {
        this.auth = true;
        this.authState$.next(this.auth);
        this.userData$.next(user);
      }                  
    });
  }

  // Login User with Email and Password
  loginLocalUser(email: string, password: string) {
    this.http.post(`${this.serverUrl}/auth/login`, {email, password}).subscribe((data: any) => {
      this.auth = data.auth;
      this.authState$.next(this.auth);
      this.userData$.next(data);
    });
  }

  logoutUser() {
    this.authService.signOut();
    this.auth = false;
    this.authState$.next(this.auth);
  }

  // Google Authentication
  signInWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }
  
  signOut(): void {
    this.authService.signOut();
    this.auth = false;
    this.authState$.next(this.auth);
  }  
}
