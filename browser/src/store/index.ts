import { createStore, applyMiddleware, Store } from 'redux';
import { logger } from '../middleware';
import rootReducer, { RootState } from '../reducers';
import thunk from 'redux-thunk';

export default function configureStore(initialState?: RootState): Store<RootState> {
    const store = createStore(rootReducer, initialState, applyMiddleware(thunk, logger));

    return store;
}
