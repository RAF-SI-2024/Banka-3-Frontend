import {BehaviorSubject, of} from 'rxjs';

// Mock ActivatedRoute
export class MockActivatedRoute {
  parent = {
    snapshot: { data: { title: 'myTitle ' } },
    routeConfig: {
      children: {
        filter: () => {}
      }
    }
  };
}

// Mock AuthService
export class MockAuthServiceEmployee {
  private authStatus = new BehaviorSubject<boolean>(true);
  authStatus$ = this.authStatus.asObservable();

  isAdmin() {
    return false;
  }

  isEmployee() {
    return true;
  }

  isClient() {
    return false;
  }

  getUserId() {
    return 1;
  }
}
// Mock AuthService
export class MockAuthServiceAdmin {
  private authStatus = new BehaviorSubject<boolean>(true);
  authStatus$ = this.authStatus.asObservable();

  isAdmin() {
    return true;
  }

  isEmployee() {
    return false;
  }

  isClient() {
    return false;
  }

  getUserId() {
    return 1;
  }
}

// Mock AuthService
export class MockAuthServiceClient {
  private authStatus = new BehaviorSubject<boolean>(true);
  authStatus$ = this.authStatus.asObservable();

  isAdmin() {
    return false;
  }

  isEmployee() {
    return false;
  }

  isClient() {
    return true;
  }

  getUserId() {
    return 1;
  }
}
export class MockClientService {
  getAllUsers(page: number, size: number) {
    return of({
      content: [
        {
          id: 1,
          firstName: 'test',
          lastName: 'test',
          email: 'test@test.com',
          gender: 'male',
          birthDate: new Date(),
          jmbg: '123123123',
        },
        {
          id: 2,
          firstName: 'test2',
          lastName: 'test2',
          email: 'test2@test.com',
          gender: 'male',
          birthDate: new Date(),
          jmbg: '123123123',
        },
      ],
      totalElements: 2,
    });
  }

}
