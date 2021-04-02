import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SocialAuthService } from 'angularx-social-login';
import { SocialUser } from "angularx-social-login";
import { map } from 'rxjs/operators';
import { UserService } from 'src/app/services/user.service';
import { UserResponse } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  myUser: any;

  constructor(private authService: SocialAuthService,
              private userService: UserService,
              private router: Router) { }

  ngOnInit(): void {
    this.userService.userData$.pipe(map((user: SocialUser | UserResponse) => {
          //if (user instanceof SocialUser || user.type === 'social') {
          if (user instanceof SocialUser) {
            return {
              ...user,
              email: 'test@test.com'
            };
          } else { return user; }
        })).subscribe((data: UserResponse | SocialUser) => { this.myUser = data; });
  }

  userlogout() {
    this.userService.logoutUser();
  }

}
