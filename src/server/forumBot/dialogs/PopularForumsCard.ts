/* eslint-disable */
import * as ACData from "adaptivecards-templating"
const popularForumsCard = require("./PopularForumsCard.json")
import { path } from "../helper/imagePath"

const PopularForumsCard = () => {
    const template = new ACData.Template(popularForumsCard)

    const context: any = {
        "$root": {
            img1: path("adobe.png"),
            img2: path("airbnb.png"),
            img3: path("reddit.png"),
            img4: path("ubuntu.png"),
            img5: path("ww.png")
        }
    }

    return template.expand(context)
}

export default PopularForumsCard