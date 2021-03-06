import React from 'react'
import { connect } from 'react-redux'

import { ImportStyle } from 'sp-css-import'

import htmlHead from '@appUtils/html-head.js'
import db from '@appLogic/database'

import Page from '@appUI/containers/page'

import ListCasters from '@appUI/components/list/casters'
import ListArtists from '@appUI/components/list/artists'
import Title from '@appUI/components/title'

@connect()
// @ImportStyle(style)
export default class extends React.Component {
    static onServerRenderHtmlExtend({ htmlTool: ext, store }) {
        const head = htmlHead({
            store,
            title: __('nav.entities')
        })

        ext.metas = ext.metas.concat(head.meta)
        ext.title = head.title
    }

    render() {
        const listCVs = []
        const listArtists = []

        for (let id in db.entities) {
            const entity = db.entities[id]
            if (!entity.relation) continue
            if (Array.isArray(entity.relation.cv) && entity.relation.cv.length)
                listCVs.push(entity)
            if (Array.isArray(entity.relation.illustrator) && entity.relation.illustrator.length)
                listArtists.push(entity)
        }

        return (
            <Page
                className={this.props.className}
            >
                <ListTitle>{__('seiyuus')}</ListTitle>
                <ListCasters
                    list={listCVs.sort((a, b) => (
                        b.relation.cv.length - a.relation.cv.length
                    ))}
                    count={true}
                />

                <ListTitle>{__('artists')}</ListTitle>
                <ListArtists
                    list={listArtists.sort((a, b) => (
                        b.relation.illustrator.length - a.relation.illustrator.length
                    ))}
                    count={true}
                />
            </Page>
        )
    }
}

@ImportStyle(require('./styles-title.less'))
class ListTitle extends React.Component {
    render() {
        return (
            <Title
                component="h2"
                type="line-append"
                inherit={true}
                {...this.props}
            />
        )
    }
}
