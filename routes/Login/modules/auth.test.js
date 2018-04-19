import {
  call,
  put,
} from 'redux-saga/effects';
import md5 from 'blueimp-md5';
import {
  LOGIN_FAIL,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGOUT_FAIL,
  LOGOUT_REQUEST,
  LOGOUT_SUCCESS,
  initialState,
  login,
  loginApi,
  loginFail,
  loginRequest,
  loginSuccess,
  logout,
  logoutApi,
  logoutFail,
  logoutRequest,
  logoutSuccess,
  reducer,
} from './auth';
import {
  clearUserInfo,
  fetchUserInfoRequest,
} from './user';
import testLogInData from '../../../testLogInData.data';

describe('auth action creators', () => {
  it('dispatch login request action', () => {
    const accountInfo = {
      email: 'email',
      password: 'password',
    };
    const actual = loginRequest(accountInfo);
    const expected = {
      type: LOGIN_REQUEST,
      payload: accountInfo,
    };
    expect(actual).toEqual(expected);
  });

  it('dispatch login success action', () => {
    const actual = loginSuccess();
    const expected = {
      type: LOGIN_SUCCESS,
    };
    expect(actual).toEqual(expected);
  });

  it('dispatch login fail action', () => {
    const error = {
      message: 'error message',
    };
    const actual = loginFail(error);
    const expected = {
      type: LOGIN_FAIL,
      payload: {
        message: error.message,
      },
    };
    expect(actual).toEqual(expected);
  });

  it('dispatch logout request action', () => {
    const actual = logoutRequest();
    const expected = { type: LOGOUT_REQUEST };
    expect(actual).toEqual(expected);
  });

  it('dispatch logout success action', () => {
    const actual = logoutSuccess();
    const expected = { type: LOGOUT_SUCCESS };
    expect(actual).toEqual(expected);
  });

  it('dispatch logout fail action', () => {
    const error = { message: 'error message' };
    const actual = logoutFail(error);
    const expected = {
      type: LOGOUT_FAIL,
      payload: {
        message: error.message,
      },
    };
    expect(actual).toEqual(expected);
  });
});

describe('auth reducers', () => {
  it('Dispatch no action. Expect initial state', () => {
    const action = {};
    const actual = reducer(initialState, action);
    const expected = initialState;
    expect(actual).toEqual(expected);
  });

  it('Dispatch login request action. Expect fetching flag being true', () => {
    const action = {
      type: LOGIN_REQUEST,
    };
    const actual = reducer(initialState, action);
    const expected = {
      ...initialState,
      isFetching: true,
    };
    expect(actual).toEqual(expected);
  });

  it('Dispatch login success action. Expect auth flag being true.', () => {
    const testState = {
      ...initialState,
      errorMessage: '信箱或密碼錯誤',
    };
    const actual = reducer(testState, loginSuccess());
    const expected = {
      ...initialState,
      errorMessage: '',
      isFetching: false,
      isLoggedIn: true,
    };
    expect(actual).toEqual(expected);
  });

  it('Dispatch login fail action. Expect fetching flag being false and update error message', () => {
    const error = {
      message: 'error message',
    };
    const actual = reducer(initialState, loginFail(error));
    const expected = {
      ...initialState,
      errorMessage: error.message,
      isFetching: false,
    };
    expect(actual).toEqual(expected);
  });

  it('Dispatch logout request action. Expect fetching flag being true', () => {
    const action = {
      type: LOGOUT_REQUEST,
    };
    const actual = reducer(initialState, action);
    const expected = {
      ...initialState,
      isFetching: true,
    };
    expect(actual).toEqual(expected);
  });

  it('Dispatch logout success action. Expect fetching flag being false and auth flag being false', () => {
    const testState = {
      ...initialState,
      errorMessage: '取得使用者資料錯誤',
    };
    const actual = reducer(testState, logoutSuccess());
    const expected = {
      ...initialState,
      errorMessage: '',
      isFetching: false,
      isLoggedIn: false,
    };
    expect(actual).toEqual(expected);
  });

  it('Dispatch logout fail action. Expect fetching flag being false and update error message', () => {
    const error = {
      message: 'error message',
    };
    const actual = reducer(initialState, logoutFail(error));
    const expected = {
      ...initialState,
      errorMessage: error.message,
      isFetching: false,
    };
    expect(actual).toEqual(expected);
  });
});

describe('Successful login flow', () => {
  const action = {
    type: LOGIN_REQUEST,
    payload: {
      email: testLogInData.email,
      password: testLogInData.password,
    },
  };
  const generator = login(action);

  it('Start login request process. Call loginApi with correct account Info', () => {
    const actual = generator.next();
    const requestData = {
      accountInfo: {
        email: action.payload.email,
        password: md5(action.payload.password),
      },
      apiParam: '/login',
    };
    const expected = call(loginApi, requestData);
    expect(actual.value).not.toBeUndefined();
    expect(actual.value).toEqual(expected);
    expect(actual.done).toEqual(false);
  });

  it('Successfully calling loginApi and receive correct response status. Dispatch login success action', () => {
    const fakeResponse = {
      data: {
        status: '200',
      },
    };
    const actual = generator.next(fakeResponse);
    const expected = put(loginSuccess());
    expect(actual.value).toEqual(expected);
    expect(actual.done).toEqual(false);
  });

  it('After dispatching login success action. Dispatch fetch user info action', () => {
    const actual = generator.next();
    const expected = put(fetchUserInfoRequest());
    expect(actual.value).toEqual(expected);
    expect(actual.done).toEqual(false);
  });

  it('should be done', () => {
    const actual = generator.next();
    expect(actual.value).toBeUndefined();
    expect(actual.done).toEqual(true);
  });
});

describe('Login flow when server does not respond', () => {
  const action = {
    type: LOGIN_REQUEST,
    payload: {
      email: testLogInData.email,
      password: testLogInData.password,
    },
  };
  const generator = login(action);

  it('Start login request process. Call loginApi with correct account Info', () => {
    const actual = generator.next();
    const requestData = {
      accountInfo: {
        email: action.payload.email,
        password: md5(action.payload.password),
      },
      apiParam: '/login',
    };
    const expected = call(loginApi, requestData);
    expect(actual.value).not.toBeUndefined();
    expect(actual.value).toEqual(expected);
    expect(actual.done).toEqual(false);
  });

  it('Fail to call loginApi. Dispatch login fail action', () => {
    const errorMessage = 'login fail';
    const actual = generator.throw(errorMessage);
    const expected = put(loginFail(errorMessage));
    expect(actual.value).toEqual(expected);
    expect(actual.done).toEqual(false);
  });

  it('should be done', () => {
    const actual = generator.next();
    expect(actual.value).toBeUndefined();
    expect(actual.done).toEqual(true);
  });
});

describe('Login flow when user type wrong email or password', () => {
  const action = {
    type: LOGIN_REQUEST,
    payload: {
      email: testLogInData.email,
      password: testLogInData.password,
    },
  };
  const generator = login(action);

  it('Start login request process. Call loginApi with correct account Info', () => {
    const actual = generator.next();
    const requestData = {
      accountInfo: {
        email: action.payload.email,
        password: md5(action.payload.password),
      },
      apiParam: '/login',
    };
    const expected = call(loginApi, requestData);
    expect(actual.value).not.toBeUndefined();
    expect(actual.value).toEqual(expected);
    expect(actual.done).toEqual(false);
  });

  it('Successfully calling loginApi but receive incorrect response status. Dispatch login success action with response data', () => {
    const fakeResponse = {
      data: {
        status: '400',
        message: '信箱或密碼錯誤',
      },
    };
    const actual = generator.next(fakeResponse);
    const expected = put(loginFail({ message: fakeResponse.data.message }));
    expect(actual.value).toEqual(expected);
    expect(actual.done).toEqual(false);
  });

  it('should be done', () => {
    const actual = generator.next();
    expect(actual.value).toBeUndefined();
    expect(actual.done).toEqual(true);
  });
});

describe('Successful logout flow', () => {
  const action = { type: LOGOUT_REQUEST };
  const generator = logout(action);

  it('Start logout request process. Call loginApi', () => {
    const actual = generator.next();
    const requestData = {
      apiParam: '/logout',
    };
    const expected = call(logoutApi, requestData);
    expect(actual.value).not.toBeUndefined();
    expect(actual.value).toEqual(expected);
    expect(actual.done).toEqual(false);
  });

  it('Successfully calling logoutApi and receive correct response status. Dispatch logout success action', () => {
    const fakeResponse = {
      data: {
        status: '200',
      },
    };
    const actual = generator.next(fakeResponse);
    const expected = put(logoutSuccess());
    expect(actual.value).toEqual(expected);
    expect(actual.done).toEqual(false);
  });

  it('After dispatching logout success action. Dispatch clear user info action', () => {
    const actual = generator.next();
    const expected = put(clearUserInfo());
    expect(actual.value).toEqual(expected);
    expect(actual.done).toEqual(false);
  });

  it('should be done', () => {
    const actual = generator.next();
    expect(actual.value).toBeUndefined();
    expect(actual.done).toEqual(true);
  });
});

describe('Logout flow when server does not respond', () => {
  const action = {
    type: LOGOUT_REQUEST,
  };
  const generator = logout(action);

  it('Start logout request process. Call logoutApi', () => {
    const actual = generator.next();
    const requestData = {
      apiParam: '/logout',
    };
    const expected = call(logoutApi, requestData);
    expect(actual.value).not.toBeUndefined();
    expect(actual.value).toEqual(expected);
    expect(actual.done).toEqual(false);
  });

  it('Fail to call loginApi. Dispatch logout fail action', () => {
    const errorMessage = 'logout fail';
    const actual = generator.throw(errorMessage);
    const expected = put(logoutFail(errorMessage));
    expect(actual.value).toEqual(expected);
    expect(actual.done).toEqual(false);
  });

  it('should be done', () => {
    const actual = generator.next();
    expect(actual.value).toBeUndefined();
    expect(actual.done).toEqual(true);
  });
});
