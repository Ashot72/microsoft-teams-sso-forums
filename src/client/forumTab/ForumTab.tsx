/* eslint-disable */
import * as React from "react"
import { HashRouter as Router, Route, Switch } from "react-router-dom"

import { AppStateProvider } from '../../contexts/AppContext'
import Forums from "./components/Forums/ForumsView"
import Topics from "./components/Topics/TopicsView"
import Posts from "./components/Posts/PostsView"

export const ForumTab = () =>
    <AppStateProvider>
        <Router>
            <Switch>
                {/* <Provider theme={theme}> is not included here as Fluent U Themes do not work with routing  */}
                <Route exact path="/" component={Forums} />
                <Route path="/topics/:fid" component={Topics} />
                <Route path="/posts/:fid/:tid" component={Posts} />
                <Route path="*" component={Forums} />
            </Switch>
        </Router>
    </AppStateProvider>



