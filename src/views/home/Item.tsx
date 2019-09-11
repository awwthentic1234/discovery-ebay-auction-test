import React, {Component} from 'react';
import * as ReactDOM from "react-dom";
import "./item.css";
import TextTruncate from 'react-text-truncate';
import Countdown from 'react-countdown-now';
import dateFormat from 'dateformat';
import { createStore } from 'redux';
import {Back, Expo, TweenMax, CSSPlugin} from "gsap/all";
import AutoScale from 'react-auto-scale';
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
//class setup
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
export type Item_props = {
	key: number,
	item: {
		image:string,
		title: string,
		itemid: string
		condition: any,
		price:string,
        itemUrl:string,
        node:any[],
        on_remove:() => void
	}
};
//-----------------------------------------------------------------------------------------
class Item extends Component<Item_props> {
	///////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////
	//methods
	///////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////
    private loaded(e) {
        let img = e.target;
        const position = img.style.position;
        img.style.position = "absolute";
        img.style.display = "block";
        const width = img.clientWidth;
        const height = img.clientHeight;
        img.style.position = position;
        if (width > height) {
            img.classList.add('fit_width');
        } else {
            img.classList.add('fit_height');
        }
    }
    //----------------------------------------------------
    public componentDidMount() {
        let elm = ReactDOM.findDOMNode(this);
        //console.log(elm);
        //let img = elm.children("img");
        let img = (elm as HTMLElement).querySelector("img");
        if (!img.complete) {
            img.style.display = "none";
            img.addEventListener('load', this.loaded)
            img.addEventListener('error', function() {
                alert('error')
            })
        }
        //console.log(img);
    }
    //----------------------------------------------------
    public render() {
        const {itemUrl, image, title, condition, price, node} = this.props.item;
        return (
            <a target = "_blank" href={itemUrl}>
                <div className = "item" >
                    <div className = 'left cell'>
                        <div className = 'img_shell'>
                            <img src={image}/>
                        </div>
                    </div>
                    <div className = "right cell">
                        <div className = "content">
                            <div className = 'title'>
                                <TextTruncate
                                    line={2}
                                    element="span"
                                    truncateText="…"
                                    text={''+this.props.item.title+''}
                                />
                            </div>

                            <p className = 'condition'><span>Condition:</span> {condition}</p>
                            <p className = "price">${price}</p>
                            {node.map((i: any, key) =>
                                <div key={key}>{i}</div>
                            )}
                        </div>
                    </div>
                </div>
            </a>
        );
    }
}
//----------------------------------------------------
export default Item;
//----------------------------------------------------
// Hot Module Replacement
if (module.hot) {
  module.hot.accept("./Item.tsx", () => {
    const NewApp = require("./Item.tsx").default;
    ReactDOM.render(NewApp, document.getElementById("content"));
  });
}