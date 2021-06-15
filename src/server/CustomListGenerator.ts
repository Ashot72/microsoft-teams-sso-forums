/* eslint-disable */
import axios from 'axios'

import { teams_forums, teams_topics, teams_posts } from "../lists"

enum FieldTypes {
    Text = 2,
    Boolean = 8,
    MultiLine = 3,
    Number = 9,
    DateTime = 4
}

interface IFieldStructure {
    title: string
    type: FieldTypes
    required: boolean
}

interface IListStructure {
    title: string
    description: string
    template: number
    hidden: boolean
    fields?: IFieldStructure[]
}

export default class CustomListGenerator {
    private accessToken: string
    private siteUrl: string

    public checkLists(accessToken: string, siteUrl: string): Promise<boolean> {
        this.accessToken = accessToken
        this.siteUrl = siteUrl

        return this.listExists()
    }

    public generateLists(): Promise<void> {
        return new Promise<void>(resolve => {

            this.createForumsLists()
                .then(() => this.createTopicsLists())
                .then(() => this.createPostsLists())
                .then(() => resolve())
        })
    }

    private listExists(): Promise<boolean> {
        return axios.get(`${this.siteUrl}/_api/web/lists/GetByTitle('${teams_forums}')/items`, {
            headers: {
                Authorization: `Bearer ${this.accessToken}`,
                accept: 'application/json;odata=verbose'
            }
        })
            .then(() => Promise.resolve(true))
            .catch(() => Promise.resolve(false))
    }

    private createForumsLists(): Promise<any> {
        return this.createListSP({
            title: teams_forums,
            description: 'Forums Hooks Forums',
            template: 100,
            hidden: false,
            fields: [
                { title: 'Description', type: FieldTypes.MultiLine, required: true },
                { title: 'CreatorName', type: FieldTypes.Text, required: true },
                { title: 'LastTopic', type: FieldTypes.Text, required: false },
                { title: 'LastForumId', type: FieldTypes.Number, required: false },
                { title: 'LastTopicId', type: FieldTypes.Number, required: false },
                { title: 'LastPosterName', type: FieldTypes.Text, required: false },
                { title: 'LastPosterEmail', type: FieldTypes.Text, required: false },
                { title: 'LastUpdate', type: FieldTypes.Number, required: false },
                { title: 'Topics', type: FieldTypes.Number, required: true },
                { title: 'Posts', type: FieldTypes.Number, required: true },
                { title: 'CreatedDate', type: FieldTypes.Number, required: true }
            ]
        })
    }

    private createTopicsLists(): Promise<any> {
        return this.createListSP({
            title: teams_topics,
            description: 'Forums Hooks Topics',
            template: 100,
            hidden: false,
            fields: [
                { title: 'ForumId', type: FieldTypes.Number, required: true },
                { title: 'Description', type: FieldTypes.MultiLine, required: true },
                { title: 'CreatorName', type: FieldTypes.Text, required: true },
                { title: 'CreatorEmail', type: FieldTypes.Text, required: false },
                { title: 'LastPosterName', type: FieldTypes.Text, required: false },
                { title: 'LastPosterEmail', type: FieldTypes.Text, required: false },
                { title: 'LastUpdate', type: FieldTypes.Number, required: false },
                { title: 'Views', type: FieldTypes.Number, required: true },
                { title: 'Replies', type: FieldTypes.Number, required: true },
                { title: 'CreatedDate', type: FieldTypes.Number, required: true }
            ]
        })
    }

    private createPostsLists(): Promise<any> {
        return this.createListSP({
            title: teams_posts,
            description: 'Forums Hooks Posts',
            template: 100,
            hidden: false,
            fields: [
                { title: 'ForumId', type: FieldTypes.Number, required: true },
                { title: 'TopicId', type: FieldTypes.Number, required: true },
                { title: 'PosterName', type: FieldTypes.Text, required: true },
                { title: 'PosterEmail', type: FieldTypes.Text, required: false },
                { title: 'Content', type: FieldTypes.MultiLine, required: true },
                { title: 'Answered', type: FieldTypes.Boolean, required: true },
                { title: 'CreatedDate', type: FieldTypes.Number, required: true }
            ]
        })
    }

    private createListSP(element: IListStructure): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const createField = (guid: string, field: string, fieldTypeKind: FieldTypes, required: boolean): Promise<void> => {

                return axios.post(`${this.siteUrl}/_api/web/lists(guid'${guid}')/Fields`, {
                    "__metadata": {
                        "type": "SP.Field"
                    },
                    Title: field,
                    FieldTypeKind: fieldTypeKind,
                    Required: required
                }, {
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`,
                        accept: 'application/json;odata=verbose',
                        'content-type': 'application/json;odata=verbose'
                    }
                })
            }

            const { title, description, template, hidden, fields } = element

            axios.post(`${this.siteUrl}/_api/web/lists`, {
                "__metadata": {
                    "type": "SP.List"
                },
                BaseTemplate: template,
                Description: description,
                Title: title,
                Hidden: hidden
            }, {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    accept: 'application/json;odata=verbose',
                    'content-type': 'application/json;odata=verbose'
                },
            })
                .then(async result => {
                    if (fields) {
                        let count = 0
                        for (let field of fields) {
                            await createField(result.data.d.Id, field.title, field.type, field.required)
                                .then(() => {
                                    count++
                                    if (count === fields.length) {
                                        resolve()
                                    }
                                })
                                .catch(e => reject(e))
                        }
                    }
                })
        })
    }
}