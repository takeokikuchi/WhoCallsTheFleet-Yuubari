import React from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames'
import { ImportStyle } from 'sp-css-import'

import db from '@appLogic/database'
// import pref from '@appLogic/preferences'

import htmlHead from '@appUtils/html-head'
import getTimeJST from '@appUtils/get-time-jst'
import getLink from '@appUtils/get-link'
import getShip from '@appUtils/get-ship'
import getEquipment from '@appUtils/get-equipment'
import sortShips from '@appUtils/sort-ships'
// import routerReplace from '@appUtils/router-replace'

// import {Link, IndexLink} from 'react-router'
import Page from '@appUI/containers/page'

import Link from '@appUI/components/link'
import LinkEquipment from '@appUI/components/link/equipment'
import Title from '@appUI/components/title'
import Button from '@appUI/components/button'
import MainHeader from '@appUI/components/main-header/main-options'
import {
    DayAndShip as ImprovementDayAndShip,
    Resources as ImprovementResources
} from '@appUI/components/improvement'
import ImprovementStar from '@appUI/components/improvement/star'

const daysArr = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thurday",
    "Friday",
    "Saturday"
]

@connect()
@ImportStyle(require('./styles.less'))
export default class PageArsenal extends React.Component {
    static onServerRenderHtmlExtend({ htmlTool: ext, store }) {
        const state = store.getState()
        const pathname = state.routing.locationBeforeTransitions.pathname
        const segs = pathname.split('/')
        const indexArsenal = segs.indexOf('arsenal')
        let day

        if (typeof segs[indexArsenal + 1] !== 'undefined')
            day = __(`day_full`, daysArr[parseInt(segs[indexArsenal + 1])])

        const head = htmlHead({
            store,
            title: [
                __('nav.arsenal'),
                day
            ]
        })

        ext.metas = ext.metas.concat(head.meta)
        ext.title = head.title
    }

    state = {
        rendering: true
    }

    componentDidUpdate(prevProps/*, prevState*/) {
        // const prevParams = prevProps.params || {}
        // const params = this.props.params || {}
        if (prevProps.params.day !== this.props.params.day)
            window.scrollTo(undefined, 0)
    }

    onRender() {
        // if (!this.state.rendering)
        this.setState({
            rendering: false
        })
    }

    render() {
        const day = typeof this.props.params === 'object' && typeof this.props.params.day !== 'undefined'
            ? this.props.params.day
            : -1
        // console.log(db)
        // console.log('[PageArsenal] render')
        return (
            <Page
                className={this.props.className}
                pathname={this.props.location.pathname}
                rendering={this.state.rendering}
            // location={this.props.location}
            // params={this.props.params}
            // route={this.props.route}
            // routeParams={this.props.routeParams}
            // router={this.props.router}
            // routes={this.props.routes}
            >
                <PageArsenalHeader isDay={typeof this.props.params === 'object' && typeof this.props.params.day !== 'undefined'} />

                {day > -1 && <PageArsenalListDay day={day} onRender={this.onRender.bind(this)} />}
                {day === -1 && <PageArsenalListAll onRender={this.onRender.bind(this)} />}
            </Page>
        )
    }
}

@ImportStyle(require('./styles-header.less'))
class PageArsenalHeader extends React.Component {
    render() {
        const jst = getTimeJST()
        const jstDay = jst.getDay()
        return <MainHeader
            className={classNames({
                [this.props.className]: true,
                // 'is-options-show': this.props.isModeFilter,
            })}

            mainClassName={this.props.className + "-tabs"}
            main={[
                <PageArsenalHeaderAkashi className={this.props.className + "-akashi"} key="akashi" />,
                <Link
                    key="today"
                    href={`/arsenal/${jstDay}`}
                    replace={true}
                    className={classNames(['tab', "link-today"])}
                    children={__(`arsenal.filter_by_day`)}
                />,
                ...daysArr.map((day, index) => (
                    <Link
                        key={day}
                        href={`/arsenal/${index}`}
                        replace={true}
                        className={classNames({
                            tab: true,
                            'link-day': true,
                            'is-today': jstDay === index
                        })}
                        activeClassName="on"
                        children={__(`day_abbr`, day)}
                    />
                )),
                <Link
                    key="all"
                    href={`/arsenal`}
                    replace={true}
                    className={classNames({
                        tab: true,
                        'link-all': true,
                        'on': !this.props.isDay
                    })}
                    children={__(`arsenal.all`)}
                />
            ]}
        />
    }
}

class PageArsenalHeaderAkashi extends React.Component {
    state = {
        animation: Math.floor((Math.random() * 3) + 1)
    }
    changeAnimation() {
        this.setState({
            animation: Math.floor((Math.random() * 3) + 1)
        })
    }
    render() {
        return (
            <span
                className={this.props.className}
                data-blink-animation={this.state.animation}
                onAnimationIteration={this.changeAnimation.bind(this)}
            />
        )
    }
}

class PageArsenalList extends React.Component {
    render() {
        // console.log('[PageArsenalList] render')
        return this.props.collections.map((collection, index) => (
            <PageArsenalCollection
                key={`collection-${collection.title}`}
                title={collection.title}
                index={index}
                onRender={() => {
                    if (typeof this.props.onRender === 'function' &&
                        index >= this.props.collections.length - 1
                    )
                        this.props.onRender(this)
                }}
            >
                {collection.list}
            </PageArsenalCollection>
        ))
    }
}

const PageArsenalListDay = (props) => {
    // console.log('[PageArsenalListDay] render')

    let lastCollection = -1
    const collectionIndexMap = {}
    const collections = []

    db.arsenalDays[props.day].forEach((item, _index) => {
        const equipment = getEquipment(item[0])
        const improvementIndex = item[1]

        if (!Array.isArray(equipment.improvement) || !equipment.improvement[improvementIndex])
            return null

        let collection
        // console.log(db.equipmentCollections)
        db.equipmentCollections.some(o => {
            o.list.some(l => {
                if (equipment.type === l.type)
                    collection = o.name
                return typeof collection !== 'undefined'
            })
            return typeof collection !== 'undefined'
        })
        let index = collectionIndexMap[collection]
        if (lastCollection !== collection && typeof collection !== 'undefined') {
            lastCollection = collection
            if (typeof collectionIndexMap[collection] === 'undefined') {
                index = collections.length
                collectionIndexMap[collection] = collections.length
                collections.push({
                    title: collection,
                    list: []
                })
            }
            // list.push(
            //     <PageArsenalListTitle key={`title-${collection}`} children={collection} />
            // )
        }

        collections[index].list.push(<PageArsenalListItem
            key={JSON.stringify(item)}
            equipment={equipment}
            improvementIndex={improvementIndex}
            requirements={item[2]}
            index={_index}
        />)
    })

    return (
        <PageArsenalList collections={collections} {...props} />
    )
}

const PageArsenalListAll = (props) => {
    // console.log('[PageArsenalListAll] render')

    let lastCollection = -1
    const collectionIndexMap = {}
    const collections = []

    db.arsenalAll.forEach(item => {
        const equipment = getEquipment(item)

        if (!Array.isArray(equipment.improvement) || !equipment.improvement.length)
            return null

        let collection
        // console.log(db.equipmentCollections)
        db.equipmentCollections.some(o => {
            o.list.some(l => {
                if (equipment.type === l.type)
                    collection = o.name
                return typeof collection !== 'undefined'
            })
            return typeof collection !== 'undefined'
        })
        let index = collectionIndexMap[collection]
        if (lastCollection !== collection && typeof collection !== 'undefined') {
            lastCollection = collection
            if (typeof collectionIndexMap[collection] === 'undefined') {
                index = collections.length
                collectionIndexMap[collection] = collections.length
                collections.push({
                    title: collection,
                    list: []
                })
            }
            // list.push(
            //     <PageArsenalListTitle key={`title-${collection}`} children={collection} />
            // )
        }

        equipment.improvement.forEach((improvement, _index) => {
            collections[index].list.push(
                <PageArsenalListItem
                    key={item + '-' + _index}
                    equipment={equipment}
                    improvementIndex={_index}
                    index={_index}
                />
            )
        })
    })

    return (
        <PageArsenalList collections={collections} {...props} />
    )
}

@ImportStyle(require('./styles-collection.less'))
class PageArsenalCollection extends React.Component {
    rendered = false

    constructor(props) {
        super(props)
        const render = __SERVER__ || (props.index === 0) || (__CLIENT__ && !self.isAppReady)
        this.state = {
            render,
            // show: false
        }
        if (!render) {
            setTimeout(() => {
                this.setState({
                    render: true
                })
                if (typeof props.onRender === 'function')
                    props.onRender(this)
            }, 20 * (props.index || 0))
        } else if (typeof props.onRender === 'function') {
            props.onRender(this)
        }
    }
    render() {
        if (!this.state.render) return null
        // console.log(this.props.index, this.state.render)
        return (
            <div className={this.props.className}>
                <Title
                    component="h2"
                    type="line-append"
                    className={`${this.props.className}-title`}
                    inherit={true}
                    /*
                    className={classNames({
                        [`${this.props.className}-title`]: true,
                        'on': this.state.show
                    })}
                    onClick={() => {
                        this.setState({
                            show: !this.state.show
                        })
                    }}
                    */
                    key={`${this.props.title}-title`}
                    children={this.props.title.split('&').join(' & ')}
                />
                <div
                    /*
                    className={classNames({
                        [`${this.props.className}-list`]: true,
                        'on': this.state.show
                    })}
                    children={this.state.show && this.props.children}
                    */
                    className={`${this.props.className}-list`}
                    children={this.state.render ? this.props.children : undefined}
                    key={`${this.props.title}-list`}
                />
            </div>
        )
    }
}

@ImportStyle(require('./styles-item.less'))
class PageArsenalListItem extends React.Component {
    state = {
        // render: __SERVER__ || (props.index === 0) || (__CLIENT__ && !self.isAppReady),
        expand: false
    }
    // componentWillMount() {
    //     if (!this.state.render)
    //         setTimeout(() => {
    //             this.setState({
    //                 render: true
    //             })
    //         }, 1 * (this.props.index || 0))
    // }
    render() {
        // if (!this.state.render) return null

        const {
            className,
            equipment,
            improvementIndex,
            requirements
        } = this.props

        const reqShips = []
        const data = equipment.improvement[improvementIndex]
        const hasUpgrade = Array.isArray(data.upgrade) && data.upgrade.length
        const showReqShips = Array.isArray(requirements)

        if (showReqShips) {
            requirements.forEach(index => {
                if (!Array.isArray(data.req) || !data.req[index] || !Array.isArray(data.req[index][1]))
                    return
                data.req[index][1].forEach(id => reqShips.push(id))
            })
        }
        const hasReqShips = reqShips.length ? true : false
        const showStar = hasUpgrade && data.upgrade[1] ? true : false

        return (
            <div className={className}>
                <span className={classNames({
                    [className + '-equipment']: true,
                    'has-upgrade': hasUpgrade,
                })}>
                    <LinkEquipment
                        className={`${className}-name color-alt-lighter`}
                        equipment={equipment}
                    />
                </span>
                {hasUpgrade &&
                    <span className={className + '-equipment'}>
                        <LinkEquipment
                            className={`${className}-name color-alt-lighter`}
                            equipment={data.upgrade[0]}
                            children={
                                showStar
                                    ? <ImprovementStar
                                        className={className + '-equipment-star'}
                                        star={data.upgrade[1]}
                                    />
                                    : undefined
                            }
                        />
                    </span>
                }

                {showReqShips &&
                    <div className={className + '-ships'}>
                        {hasReqShips && (
                            sortShips(reqShips).map(ship => {
                                ship = getShip(ship)
                                return <Link
                                    className={`${className}-ships-ship color-alt`}
                                    key={ship.id}
                                    to={getLink('ship', ship.id)}
                                    children={ship.getName(__('shipname_dash_none'))}
                                />
                            })
                        )}
                        {!hasReqShips && __('improvement.any_2nd_ship')}
                    </div>
                }

                {!showReqShips &&
                    <ImprovementDayAndShip className={className + '-day-and-ships'} data={data} />
                }

                <div className={className + '-resources'}>
                    <Button
                        className={classNames({
                            [className + '-resources-toggle']: true,
                            'is-expand': this.state.expand,
                        })}
                        onClick={() => {
                            this.setState({
                                expand: !this.state.expand
                            })
                        }}
                        //children={!this.state.expand ? __('arsenal.resources_toggle') : undefined}
                        children={!this.state.expand ? "..." : undefined}
                        data-role="toggle"
                    />
                    {this.state.expand &&
                        <ImprovementResources
                            data={data}
                        />
                    }
                </div>
            </div>
        )
    }
}
