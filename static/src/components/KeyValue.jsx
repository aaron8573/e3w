import React from 'react'
import { Box } from 'react-polymer-layout'
import { Breadcrumb } from 'antd'
import { KVList } from './request'
import KeyValueCreate from './KeyValueCreate'
import KeyValueItem from './KeyValueItem'
import KeyValueSetting from './KeyValueSetting'

const KeyValue = React.createClass({
    // states:
    // - dir: the full path of current dir, eg. / or /abc/def
    // - menus: components of Breadcrumb, including path (to another dir, using in url hash) and name
    // - list: the key under the dir, get from api

    _isRoot() {
        return this.state.dir === "/"
    },

    _parseList(list) {
        list = list || []
        // trim prefix of dir, get the relative path, +1 for /
        let prefixLen = this.state.dir.length + (this._isRoot() ? 0 : 1)
        list.forEach(l => {
            l.key = l.key.slice(prefixLen)
        })
        this.setState({ list: list })
    },

    // dir should be / for /abc/def
    _parseKey(dir) {
        let menus = [{ path: "/", name: "root" }]
        if (dir !== "/") {
            let keys = dir.split("/")
            for (let i = 1; i < keys.length; i++) {
                // get the full path of every component
                menus.push({ path: keys.slice(0, i + 1).join("/"), name: keys[i] })
            }
        }
        KVList(dir, this._parseList)
        return { dir: dir, menus: menus }
    },

    _fetch(dir) {
        this.setState(this._parseKey(dir))
        this.setState({ setting: false })
    },

    _changeMenu(dir) {
        window.location.hash = "#kv" + dir
        this._fetch(dir)
    },

    _fullKey(subKey) {
        return (this._isRoot() ? "/" : this.state.dir + "/") + subKey
    },

    _enter(subKey) {
        let dir = this._fullKey(subKey)
        window.location.hash = "#kv" + dir
        this._fetch(dir)
    },

    _set(subKey) {
        this.setState({ setting: true, currentKey: this._fullKey(subKey) })
    },

    _update() {
        this._fetch(this.state.dir)
    },

    _back() {
        // back to previous dir
        let menus = this.state.menus
        let targetPath = (menus[menus.length - 2] || menus[0]).path
        this._changeMenu(targetPath)
    },

    componentDidMount() {
        this._fetch("/" + (this.props.params.splat || ""))
    },

    getInitialState() {
        return { dir: "", menus: [], list: [], setting: false, currentKey: "" }
    },

    render() {
        let currentKey = this.state.currentKey
        return (
            <Box >
                <Box vertical style={{ minWidth: 400 }}>
                    <Breadcrumb>
                        {
                            this.state.menus.map(
                                m => (<Breadcrumb.Item key={m.path} onClick={() => this._changeMenu(m.path)}><a>{m.name}</a></Breadcrumb.Item>)
                            )
                        }
                    </Breadcrumb>
                    <Box vertical>
                        {
                            this.state.list.map(
                                l => (<KeyValueItem key={l.key} enter={this._enter} set={this._set} info={l} />)
                            )
                        }
                    </Box>
                </Box>
                {this.state.setting ?
                    (<KeyValueSetting currentKey={currentKey} />) :
                    (<KeyValueCreate update={this._update} back={this._back} dir={this.state.dir} fullKey={this._fullKey} />)}

            </Box >
        )
    }
})

module.exports = KeyValue