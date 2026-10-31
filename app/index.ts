import './src/crash'; // first, so errors while the app loads are caught too
import { registerRootComponent } from 'expo';

import App from './App';

registerRootComponent(App);
