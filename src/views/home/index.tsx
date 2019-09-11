import * as React from "react";
import * as ReactDOM from "react-dom";
import Home from "./home.tsx";
import { HashRouter } from 'react-router-dom';
import { Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
//------------------------------------------------
const initialState = {
    items:[],
    sortorder:"EndTimeSoonest"
};
//------------------------------------------------
const reducer = (state=initialState, action) => {
    const newState = {...state};
    switch(action.type){
        case 'SORT_TYPE_CHANGED':
            newState.sortorder += action.value;
            break;
    }
    return newState;
};

//------------------------------------------------
const store = createStore(reducer);
//------------------------------------------------
ReactDOM.render(
    <Provider store={store}>
        <HashRouter>
            <Route path="/" component={Home} />
        </HashRouter>
    </Provider>,
	document.getElementById("component"),
);
// Hot Module Replacement
if (module.hot) {
  module.hot.accept("./home.tsx", () => {
    const NewApp = require("./home.tsx").default;
    ReactDOM.render(<NewApp store={store}/>, document.getElementById("component"));
  });
}