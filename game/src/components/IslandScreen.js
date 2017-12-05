import React, { Component } from 'react';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import autobind from 'autobind-decorator';

import Icon from './shared/Icon';
import Text from './shared/Text';
import IconButton from './shared/IconButton';

import appStore from '../stores/app';
import heroStore from '../stores/hero';
import islandStore from '../stores/island';

import { arrayContains, islandImageRequire, getMapMargin, getIsland } from '../lib/utils';

import config from '../lib/config';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  positionInfo: {
    width: 250,
    backgroundColor: '#EAEAEA',
    height: 42,
    position: 'absolute',
    left: '50%',
    marginLeft: -(250 / 2),
    alignItems: 'center',
  },
  heroesInfo: {
    backgroundColor: '#EAEAEA',
    width: 218,
    position: 'absolute',
    right: 0,
    padding: 10,
  },
});

const SQUARE_WIDTH = 32;

const ISLAND_DIMENSIONS = {
  width: 1216 / SQUARE_WIDTH,
  height: 1216 / SQUARE_WIDTH,
};

const MAP_DIMENSIONS = {
  width: 992 / SQUARE_WIDTH, // 1024 // 984
  height: 672 / SQUARE_WIDTH, // 698 // 678
};

async function onCombat(id) {
  await heroStore.putInCombat(id);
  appStore.navigate('Combat', 'outer');
}

function renderHeroesInfo() {
  return (
    <View style={styles.heroesInfo}>
      <Text style={{ fontWeight: '400', marginBottom: 5 }}>Bots</Text>
      {islandStore.bots.map(bot => (
        <View key={bot.id} style={{ flexDirection: 'row' }}>
          <Text>
            {bot.login} [{bot.level}]
          </Text>
          <IconButton
            onPress={() => appStore.toggleWarriorInfoModal(bot)}
            style={{ marginTop: 3, marginLeft: 5 }}
          >
            <Icon size={14} name="info" />
          </IconButton>
          <IconButton style={{ marginTop: 3, marginLeft: 5 }} onPress={() => onCombat(bot.id)}>
            <Icon size={14} name="fight" />
          </IconButton>
        </View>
      ))}
    </View>
  );
}

@observer
export default class IslandScreen extends Component {
  @observable moveTime = 0;
  moveInterval = null;
  @observable test = [];
  componentDidMount() {
    const { coordinateX, coordinateY } = heroStore.hero.location;
    islandStore.updateBots(coordinateX, coordinateY);
  }
  @autobind
  onMove(x, y) {
    const index = arrayContains(this.test, [x, y]);
    if (index !== -1) {
      this.test.splice(index, 1);
    } else {
      this.test.push([x, y]);
    }
    console.log(JSON.stringify(this.test));
    const island = getIsland(appStore.initData.islands, heroStore.hero.location.island);
    // if (arrayContains(island.disabledCoordinates, [x, y])) return;

    const counter = config.islandMoveTime;

    this.moveTime = counter;

    // this.moveInterval = setInterval(() => {
    //   counter -= 1;

    //   this.moveTime = counter;

    // if (counter === 0) {
    // clearInterval(this.moveInterval);
    heroStore.moveOnIsland(x, y);
    // islandStore.updateBots(x, y);
    // }
    // }, 1000);
  }
  @autobind
  onCancelMove() {
    clearInterval(this.moveInterval);
    this.moveTime = 0;
  }
  renderPositionInfo() {
    const { coordinateX, coordinateY } = heroStore.hero.location;
    return (
      <View style={styles.positionInfo}>
        <Text>
          Position {coordinateX}:{coordinateY}
        </Text>
        {this.moveTime ? (
          <View style={{ flexDirection: 'row' }}>
            <Text>Left: {this.moveTime}</Text>
            <IconButton style={{ marginTop: 4, marginLeft: 5 }} onPress={this.onCancelMove}>
              <Icon size={12} name="cross" />
            </IconButton>
          </View>
        ) : null}
      </View>
    );
  }
  render() {
    const { hero } = heroStore;
    const { coordinateX, coordinateY } = hero.location;
    const island = getIsland(appStore.initData.islands, hero.location.island);

    const mapMargin = getMapMargin(coordinateX, coordinateY, MAP_DIMENSIONS, ISLAND_DIMENSIONS);

    const mapOffset = {
      top: Math.floor(mapMargin.top) * SQUARE_WIDTH,
      left: Math.floor(mapMargin.left) * SQUARE_WIDTH,
    };

    const squares = [];

    /* eslint-disable no-continue */
    const lineX = coordinateX - 1 + 3;
    const lineY = coordinateY - 1 + 3;
    let k = false;
    for (let x = 0; x < ISLAND_DIMENSIONS.width; x += 1) {
      if (x < 0 || x > ISLAND_DIMENSIONS.width) {
        k = true;
      }
      for (let y = 0; y < ISLAND_DIMENSIONS.height; y += 1) {
        if (y < 0 || y > ISLAND_DIMENSIONS.height) {
          k = true;
        }
        if (x === coordinateX && y === coordinateY) {
          k = true;
        }

        squares.push(<TouchableOpacity
          key={`${x}-${y}`}
          style={{
              backgroundColor: arrayContains(island.disabledCoordinates, [x, y]) !== -1 ? 'red' : undefined,
              opacity: 0.2,
              position: 'absolute',
              top: y * SQUARE_WIDTH - mapOffset.top,
              left: x * SQUARE_WIDTH - mapOffset.left,
              width: SQUARE_WIDTH,
              height: SQUARE_WIDTH,
            }}
          onPress={() => this.onMove(x, y)}
          title={`X: ${x} Y: ${y}`}
        />);
      }
    }
    /* eslint-enable no-continue */

    return (
      <View style={styles.container}>
        <View
          style={{
            height: MAP_DIMENSIONS.height * SQUARE_WIDTH,
            width: MAP_DIMENSIONS.width * SQUARE_WIDTH,
            overflow: 'hidden',
            marginLeft: 0,
          }}
        >
          <Image
            style={{
              marginTop: -mapOffset.top,
              marginLeft: -mapOffset.left,
            }}
            source={islandImageRequire(island.image)}
          />
          {squares}
          <Icon
            size={32}
            name="person"
            style={{
              position: 'absolute',
              top: coordinateY * SQUARE_WIDTH - mapOffset.top - 8,
              left: coordinateX * SQUARE_WIDTH - mapOffset.left - 2,
              backgroundColor: 'transparent',
            }}
          />
        </View>
        {this.renderPositionInfo()}
        {renderHeroesInfo()}
      </View>
    );
  }
}
