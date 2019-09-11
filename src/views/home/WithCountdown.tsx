import React, {Component} from 'react';
import * as ReactDOM from "react-dom";
import "./item.css";
import { Item_props } from "src/views/home/Item.tsx";
import Button from 'react-bootstrap/Button';
import TextTruncate from 'react-text-truncate';
import Countdown from 'react-countdown-now';
import dateFormat from 'dateformat';
import { createStore } from 'redux';
import {Back, Expo, CSSPlugin} from "gsap/all";
import { TweenMax } from "gsap/TweenMax";
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
//class setup
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
export type WithCountdown_props = {
    item: {
        time_left:string
    }
};
function passWithCountdown (WrappedComponent) {
    return class WithCountdown extends Component<Item_props & WithCountdown_props>{
        ///////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////////
        //methods
        ///////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////////
        public render() {
            const {itemUrl, image, title, condition, price, time_left} = this.props.item;
            //-----------------------
            this.props.item.node.push(
                <div className = 'count'>
                    <b><span>Time Left: </span></b>
                    <Countdown
                        date={time_left}
                        onComplete={this.countdown_complete}
                        renderer={this.countdown_renderer}
                    />
                </div>
            );
            //-----------------------
            this.props.item.node.push(<Button variant="danger">Buy Now</Button>);
            return <WrappedComponent {...this.props} />;
        }
        //------------------------------------------------
        private countdown_complete = () => {
            const node = ReactDOM.findDOMNode(this);
            let elm:any = node.firstChild;
            let delay:number = 0;
            //TweenMax.to(node.firstChild, .5 ,{delay:.4, opacity:0});
            TweenMax.set(elm, {y:0, rotationX:0});
            TweenMax.set(elm, {opacity:1, delay:delay});
            TweenMax.set(elm, {transformOrigin:"50% 0%", transformPerspective:500, transformStyle:"preserve-3d"});
            TweenMax.to(elm, .5, {opacity:0,rotationX:-90,ease:Back.easeIn, delay:delay});
            delay += .3;
            TweenMax.to(elm, .5, {height:0,ease:Expo.easeIn, delay:delay, onComplete:this.anim_complete, onCompleteParams:[node]});
            //TweenMax.to(elm, .5 ,{delay:.8, opacity:0, onComplete:this.anim_complete, onCompleteParams:[node]});
            //document.body.removeChild(node);
        }
        //------------------------------------------------
        private anim_complete = (node) => {
            const parent = node.parentNode;
            if (!parent) {
                return;
            }
            //parent.removeChild(node);
            node.style.display = "none";
            this.props.item.on_remove();
        }
        //------------------------------------------------
        private countdown_renderer = ({ hours, minutes, seconds, completed }) => {
            const Completionist = () => <span>Bid is closed</span>;
            if (completed) {
                // Render a completed state
                return <Completionist />;
            } else {
                // Render a countdown
                return <span>{hours} Hours {minutes} Minutes {seconds} Seconds</span>;
            }
        }
        //------------------------------------------------
        private numberWithCommas(x) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
    }
}
//----------------------------------------------------
export default passWithCountdown;
//----------------------------------------------------