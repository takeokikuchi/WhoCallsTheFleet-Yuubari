import React from 'react'

import db, { locale as dbLocaleId } from 'Logic/database'

import { ImportStyle } from 'sp-css-import'
import styleTitle from './title.less'

@ImportStyle(styleTitle)
export default class ShipListTitle extends React.Component {
    render() {
        if (this.props.type) {
            const type = db.shipTypes[this.props.type]
            return (
                <h4 className={this.props.className}>
                    {type.name[dbLocaleId] || type.name.ja_jp}
                    {type.code && (<small className="code">[{type.code}]</small>)}
                </h4>
            )
        } else
            return (
                <h4 className={this.props.className}>--</h4>
            )
    }
}