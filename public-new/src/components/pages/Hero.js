import React, { Component } from 'react';

import HeroBody from '../hero/Body';
import HeroInfo from '../hero/Info';

export default class extends Component {
  render() {
    return (
      <div className="uk-grid" style={{ marginTop: 5 }}>
        <div className="uk-width-4-10">
          <HeroBody />
        </div>
        <div className="uk-width-6-10">
          <HeroInfo />
        </div>
      </div>
    );
  }
}