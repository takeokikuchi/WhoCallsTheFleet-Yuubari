import React from 'react'

import ComponentContainer from '@appUI/containers/infos-component'
import ListEquipments from '@appUI/components/list/equipments'

// import { ImportStyle } from 'sp-css-import'
// import styles from './styles.less'

// @connect()
// @ImportStyle(styles)
export default class EquipmentDetailsComponentRequiredForImprovements extends React.Component {
    render() {
        const list = this.props.equipment.upgrade_for || []
        const hasItem = !!(list.length)
        return (
            <ComponentContainer className={this.props.className} title={__("equipment_details.required_for_improvements")}>
                {hasItem && <ListEquipments list={list} />}
                {!hasItem && <span className="disabled">{__("none")}</span>}
            </ComponentContainer>
        )
    }
}
