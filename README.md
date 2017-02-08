# Saga Feature Flow

> A login/register flow built with React & Redux Saga

This application demonstrates what a React-based register/login workflow might look like with [LaunchDarkly](https://launchdarkly.com) feature flags

It's based on Juan Soto's [saga-login-flow](https://github.com/sotojuan/saga-login-flow).

## Feature Flags

Feature flags are served using LaunchDarkly. The homepage will display content depending on the value returned by our feature flag. Also, the navbar will change color based on the value of the header-bar-color feature flag.

## Authentication

Authentication happens in `app/auth/index.js`, using `fakeRequest.js` and `fakeServer.js`. `fakeRequest` is a fake `XMLHttpRequest` wrapper. `fakeServer` responds to the fake HTTP requests and pretends to be a real server, storing the current users in local storage with the passwords encrypted using `bcrypt`.

## Thanks

* [Juan Soto](https://juansoto.me/) for Saga Login flow
* [Max Stoiber](https://twitter.com/mxstbr) for the Login Flow idea.
* [Yassine Elouafi](https://github.com/yelouafi) for Redux Saga. Awesome!

## License

MIT © [LaunchDarkly](https://launchdarkly.com)
