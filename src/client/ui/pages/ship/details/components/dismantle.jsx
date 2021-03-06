import React from 'react'
import classNames from 'classnames'

import ComponentContainer from '@appUI/containers/infos-component'
import Stat from '@appUI/components/stat'
import getValue from '@appUtils/get-value'
import resources from '@appData/resources'

import { ImportStyle } from 'sp-css-import'
import styles from './modernization.less'

// @connect()
@ImportStyle(styles)
export default class ShipDetailsComponentDismantle extends React.Component {
    renderItem(stat, index) {
        const value = getValue(this.props.ship.scrap[index])
        return (
            <Stat
                className={
                    classNames(['item', {
                        disabled: !value
                    }])
                }
                key={index}
                stat={stat}
            >
                {value}
            </Stat>
        )
    }
    render() {
        const hasDismantle = Array.isArray(this.props.ship.scrap)
        return (
            <ComponentContainer className={this.props.className} title={__("ship_details.dismantle")}>
                {!hasDismantle && __("none")}
                {hasDismantle && resources.map(this.renderItem.bind(this))}
            </ComponentContainer>
        )
    }
}
