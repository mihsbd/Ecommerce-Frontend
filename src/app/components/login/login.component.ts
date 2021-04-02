import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  email: string = '';
  password: string = '';
  loginMessage: string = '';
  userRole: number = 0;

  constructor(private userService: UserService,
              private router: Router,
              private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.userService.authState$.subscribe((auth: boolean) => {
      console.log(auth);
      if (auth) {        
        this.router.navigateByUrl(this.route.snapshot.queryParams.returnUrl || '/profile');
      } else {
        this.router.navigateByUrl('/login');
      }
    })
  }

  loginWithLocal(form: NgForm) {
    const email = this.email;
    const password = this.password;

    if (form.invalid) { return; }

    form.reset();
    this.userService.loginLocalUser(email, password);
    /*
    this.userService.loginMessage$.subscribe(msg => {
      this.loginMessage = msg;
      setTimeout(() => { this.loginMessage = ''; }, 2000);
    });*/
  }

  loginWithGoogle() {
    this.userService.signInWithGoogle();
  }

  

  /*
  const googleLoginOptions = {
    scope: 'profile email'
  }; // https://developers.google.com/api-client-library/javascript/reference/referencedocs#gapiauth2clientconfig
  
  let config = new AuthServiceConfig([
    {
      id: GoogleLoginProvider.PROVIDER_ID,
      provider: new GoogleLoginProvider("Google-OAuth-Client-Id", googleLoginOptions)
    }
  ]);
  */
}
