import 'assets/css/Reset.css';
import * as React from "react";
import Item from "src/views/home/Item.tsx";
import Ebay from 'lib/werm/node/Ebay.tsx';
import './home.css';
import Dom from 'lib/werm/node/Dom.tsx';
import passWithCountdown from 'src/views/home/WithCountdown.tsx';
import Dropdown from 'react-bootstrap/Dropdown';
import { connect } from "react-redux";
import Button from 'react-bootstrap/Button';
import dateFormat from 'dateformat';
import {TweenMax} from "gsap/all";
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
//class setup
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
type State = {
    total:number,
    currentCount:number,
    offset:number,
    list:any[],
    isFetching:boolean,
    sortorder:string
};
type Prop = {
    sortorder:string,
    onSortChange:(sortorder:string) => void
};
class Home extends React.Component<Prop, State> {
	///////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////
	//var
	///////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////
	private items: any[] = [];
    private page_number:number = 1;
    private sortorder:string = "EndTimeSoonest";
    private sortorder_last!:string;
    private item_featured:any[] = [];
	///////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////
	//constructor
	///////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////
	constructor(props: Prop) {
		super(props);
		this.state = {
            total:12,
            currentCount:3,
            offset:3,
            list:[],
            isFetching:false,
            sortorder:"EndTimeSoonest"
        };
	}
    //------------------------------------------------
    public dropdown_onclick = (e:any) =>  {
        const elm = document.querySelector('#dropdown-basic');
        elm.innerHTML = e.target.innerHTML;
    }
    //------------------------------------------------
    public dropdown_onselect = (e:any) => {
        this.sortorder_last = this.sortorder;
        this.sortorder = e;
        const items = this.get_items(this.sortorder);
    }
	//------------------------------------------------
	public componentDidMount() {
        window.addEventListener('scroll', this.on_scroll);
        this.get_featured_item("223139935318");
        const items = this.get_items(this.sortorder);
	}
    //------------------------------------------------
    public shouldComponentUpdate(nextProps, nextState) {
        return true;
    }
    //------------------------------------------------
    public on_scroll = (e:any) => {
        if(this.state.currentCount === this.state.total) return;

        const el = document.querySelector("#items:last-child");
        const rect = el.getBoundingClientRect();
        const isAtEnd = (
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
            rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
        );

        if(isAtEnd){
            window.removeEventListener('scroll', this.on_scroll);
            if(this.state.isFetching) return;
            this.setState({isFetching:true});
            this.page_number ++;
            this.get_items();
            this.setState({isFetching:false});
        }
    }
    //------------------------------------------------
    private get_items(sortorder?:string) {
        TweenMax.killTweensOf(document.querySelectorAll(".item"));
        this.sortorder = sortorder || this.sortorder;
        Ebay.keywords("harry,potter", {
            onComplete:this.items_recieved,
            sortorder:this.sortorder,
            page_number:this.page_number
        });
    }
    //------------------------------------------------
    private get_featured_item(item_id:string) {
        Ebay.single_item(item_id, {
            onComplete:this.featured_item_recieved
        });
    }
    //------------------------------------------------
    public featured_item_recieved = (item:any[]) => {
        this.item_featured = item;
    }
    //------------------------------------------------
    private on_child_removed = () => {
        this.on_scroll(undefined);
    }
	//------------------------------------------------
    public get_new_items (items?:any[]) {
        let new_item;
        const new_items:any[] = [];
        items = items || this.items;
        if (this.items.length === 0) return new_items;
        for (let i = 0; i < items.length; i++) {
            new_item = {};
            if (items[i].price && items[i].price.value) {
                new_item.price = items[i].price.value;
                new_item.image = items[i].image.imageUrl;
                new_item.condition = items[i].condition;
                new_item.itemUrl = items[i].itemWebUrl;
                new_item.node = [];
                new_item.node.push(<Button variant="danger">See Item</Button>);
            } else if (items[i].Item) {
                new_item.price = ""+items[i].Item.ConvertedCurrentPrice.Value;
                new_item.image = items[i].Item.PictureURL[0];
                new_item.itemUrl = items[i].Item.ViewItemURLForNaturalSearch;
                if (items[i].Item.ConditionID == 3000) {
                    new_item.condition = "Used";
                } else {
                    new_item.condition = "New";
                }
                new_item.title = items[i].Item.Title;
                new_item.time_left = items[i].Item.TimeLeft;
                new_item.time_left = this.duration_strtotime(new_item.time_left);
                new_item.node = [];
            } else {
                new_item.price = items[i].sellingStatus[0].currentPrice[0].__value__;
                //-----------------------
                new_item.time_left = items[i].sellingStatus[0].timeLeft[0];
                new_item.time_left = this.duration_strtotime(new_item.time_left);
                //-----------------------
                new_item.image = items[i].galleryURL;
                //-----------------------
                if (items[i].condition) {
                    new_item.condition = items[i].condition[0].conditionDisplayName;
                } else {
                    new_item.condition = "N/A";
                }
                //-----------------------
                new_item.itemUrl = items[i].viewItemURL;
                //-----------------------
                new_item.node = [];
                    //countdown = true;
            }
            if (new_item.price.match(/\.0$/)) {
                new_item.price += 0;
            }
            new_item.title = new_item.title || items[i].title;
            new_item.itemid = items[i].itemid;
            new_item.on_remove=this.on_child_removed;
            new_items.push(new_item);
        }
        return new_items;
    }
    //------------------------------------------------
    private duration_strtotime(str:string) {
        // REMOVE THE AMBIGUITY OF MONTH AND MINUTE -- MAKE MONTH = X
        let arr = str.split('T');
        arr[0] = arr[0].replace('M', 'X');
        let new_str = arr.join('T');

        // EXPAND THE STRING INTO SOMETHING SENSIBLE
        new_str = new_str.replace('S', 'seconds ');
        new_str = new_str.replace('M', 'minutes ');
        new_str = new_str.replace('H', 'hours ');
        new_str = new_str.replace('T', ' ');
        new_str = new_str.replace('D', 'days');
        new_str = new_str.replace('X', 'months ');
        new_str = new_str.replace('Y', 'years ');
        new_str = new_str.replace('P', "");
        arr = new_str.match(/([0-9]+)/g);
        let sec:any;
        for (let i = 0; i < arr.length; i++) {
            if (i === 0) {
                sec = (+arr[i])*86400;
            } else if (i === 1) {
                sec += (+arr[i]*3600);
            } else if (i === 2) {
                sec += (+arr[i]*60);
            } else if (i === 3) {
                sec += +arr[i];
            }
        }
        return dateFormat(new Date().getTime()+(sec*1000), "ddd, d mmmm, yyyy, H:MM:ss");
    }
    //------------------------------------------------
	public render() {
		const { sortorder } = this.state;
        const items = this.items;
        let new_items:any[];
        let new_items_featured:any[];
        let Item_to_use_featured:any = Item;
        let Item_to_use:any = Item;
		if (items) {
            new_items = this.get_new_items();
            //-----------------------
            if (items.length > 0 && !items[0].price) {
                Item_to_use = passWithCountdown(
                    Item
                );
            }
            new_items_featured = this.get_new_items(this.item_featured);
            console.log(new_items_featured);
            if (
                this.item_featured
                &&
                this.item_featured[0]
                &&
                this.item_featured[0].Item.TimeLeft
            ) {
                Item_to_use_featured = passWithCountdown(
                    Item
                );
            }
			return (
				<div id="content">
                    <div className="featured">
                        {new_items_featured.map((item: any, key) =>
                            <div key={key} className = "featured">
                                <p className = "title">FEATURED ITEM</p>
						        <Item_to_use_featured item={item} key={key}/>
                            </div>
						)}
                    </div>

					<div id = 'items'>
                        <Dropdown alignRight>
                            <Dropdown.Toggle variant="success" id="dropdown-basic">
                                Sort
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item
                                onClick={this.dropdown_onclick}
                                onSelect={this.dropdown_onselect}
                                eventKey="CurrentPriceHighest"
                                >Highest Price</Dropdown.Item>
                                <Dropdown.Item
                                onClick={this.dropdown_onclick}
                                onSelect={this.dropdown_onselect}
                                eventKey="CurrentPriceCheapest"
                                >Cheapest Price</Dropdown.Item>
                                <Dropdown.Item
                                onClick={this.dropdown_onclick}
                                onSelect={this.dropdown_onselect}
                                eventKey="EndTimeSoonest"
                                >Ending Soonest</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
						{new_items.map((item: any, key) =>
						    <Item_to_use item={item} key={key}/>
						)}
					</div>
				</div>
			);
		}
	}
	//------------------------------------------------
	private items_recieved = (items: any[]) => {
        if (this.sortorder_last === this.sortorder) {
		    this.items = this.items.concat(items);
        } else {
            this.items = items;
        }
        this.sortorder_last = this.sortorder;
        this.props.onSortChange(this.sortorder);
        window.addEventListener('scroll', this.on_scroll);
	}
}

const mapStateToProps = state => {
  return {
    sortorder: state.sortorder
  };
};

const mapDispachToProps = dispatch => {
  return {
    onSortChange: (sortorder) => dispatch({ type: "SORT_TYPE_CHANGED", value: sortorder }),
  };
};
export default connect(
  mapStateToProps,
  mapDispachToProps
)(Home);