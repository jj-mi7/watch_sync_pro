/**
 * @format
 */

import { AppRegistry } from 'react-native';
import './src/theme/unistyles'; // IMPORTANT: Load before anything else
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
