var React = require('react');
var Router = require('react-router');

var Header = require('./components/header');
var Footer = require('./components/footer');
var Messages = require('./components/messages');
var mediator = require('./mediator');

var debug = require('debug')('game:master');

var RouteHandler = Router.RouteHandler;
var State = Router.State;
var Navigation = Router.Navigation;

var Master = React.createClass({
  mixins: [State, Navigation],
  render: function() {
    var container;

    debug('master render %s', this.getPath());

    if (this.isActive('/heroes/show')) {
      container = (
        <div>
          <Header />
          <RouteHandler {...this.props} />
        </div>
      );
    } else {
      container = (
        <div>
          <RouteHandler {...this.props} />
        </div>
      );
    }

    return (
      <div>
        <div className='container'>
          {container}
        </div>
        <Footer />
        <Messages />
      </div>
    );
  }
});

module.exports = Master;
