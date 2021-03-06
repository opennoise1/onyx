import SessionManager from './sessionManager.ts';
import Strategy from './strategy.ts';

export default class Onyx {
  private _sm: any;
  private _strategies: any;
  public funcs: any;

  constructor() {
    // this.init()
    this._strategies = {};
    this.init();
    this.funcs = {};
  }

  init() {
    this._sm = new SessionManager(
      // this.serializeUser
      this.serializeUser.bind(this)
      /*, { key: this._key } */
    );
  }

  // app.post('/login', passport.authenticate('local', {failureRedirect:'/login', successRedirect: '/dashboard'}))

  // *     passport.use(new TwitterStrategy(...));  // strategy.name = 'twitter'
  // *     passport.use(new GitHubStrategy(...))
  // *     passport.use('api', new http.BasicStrategy(...)); 'basic'  'api'

  // onyx.authenticate('local', )

  use(strategy: Strategy) {
    const name = strategy.name;
    if (!name) {
      throw new Error('Authentication strategies must have a name!');
    }

    this._strategies[name] = strategy;
    return this;
  }

  authenticate(strategy: string, options: any, callback: Function) {
    if (!strategy) {
      throw new Error(
        'You must provide an authentication strategy as an argment.'
      );
    }

    const currStrat = this._strategies[strategy];
    if (!currStrat) {
      throw new Error(
        "The argued strategy is not a valid strategy. Did you remember to invoke 'onyx.use'?"
      );
    }
    console.log('hello from onyx.authenticate with currStrat', currStrat);
    return currStrat.authenticate;
  }

  serializeUser(fn?: any, context?: any) {
    if (typeof fn === 'function') {
      console.log('in serializeUser of onyx.ts');
      return (this.funcs.serializer = fn);
    }
    // else console.log('fn is user', fn);

    // const user = fn;
    // console.log('this.funcs', this.funcs);
  }

  // onyx.deserializeUser((username, done) => {
  //   done(null, {username: username});
  // });
  deserializeUser(fn: Function) {
    console.log('in deserializeUser of onyx.ts');
    this.funcs.deserializer = fn;
  }

  // if session found in memory or redis,  adding session to ctx.state.onyx
  // when onyx is initialize in server 60, will check session db for session
  initialize(onyx: any) {
    return async (context: any, next: Function) => {
      context.state.onyx = new Onyx();

      // if session entry exist, load data from that
      const userIDVal = await context.state.session.get('userIDKey');

      if (userIDVal) {
        if (!context.state.onyx.session) context.state.onyx.session = {};
        context.state.onyx.session.userID = userIDVal;
        console.log(
          'session found! info saved in context.state.onyx.session',
          context.state.onyx.session
        );
      }

      await next();
    };
  }
}
