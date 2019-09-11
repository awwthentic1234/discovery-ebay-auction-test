import axios from 'axios';
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
//class setup
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
type prop = {
	onComplete:(items: any[]) => void,
	sortorder?:string,
    page_number?:number
};
class Ebay_cls {
	///////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////
	//static methods
	///////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////
	public static keywords(keywords: string, props: prop) {
		const api = new Ebay_cls(props);
		api.keywords_CFG(keywords);
		return api;
	}
    //------------------------------------------------
    public static single_item(item_id: string, props: prop) {
		const api = new Ebay_cls(props);
		api.single_item_CFG(item_id);
		return api;
	}
	///////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////
	//var
	///////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////
    public keywords!: string;
    public items!: any[];
    private sortorder!:string;
    private sortorder_final!:string;
    private proxy_url = 'https://cors.selectiont.com/';
    private app_id:string = "wilmerab-Discover-PRD-1dfed633a-dc292d26";
    private urlfilter!: string;
    private url!: string;
    private onComplete!: (items: any[]) => void;
    private props!: prop;
    private page_number: number = 1;
    private limit:number = 10;
    public headers:object = {};
    public method:any = "get";
    private token!:string;
    private item_id!:string;
    ///////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////
	//constructor
	///////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////
	public constructor(props: prop) {
		this.onComplete = props.onComplete;
		this.sortorder = props.sortorder;
        this.page_number = props.page_number || this.page_number;
    }
    //------------------------------------------------
    public keywords_CFG(keywords: string) {
    	this.keywords = keywords;
    	this.make_call_CFG();
    }
    //------------------------------------------------
    public single_item_CFG(item_id: string) {
    	this.item_id = item_id;
    	this.make_call_CFG();
    }
    //------------------------------------------------
    public complete = (data: any) => {
        let json;
        if (typeof data === "string") {
            json = data.replace("/**/_cb_findItemsByKeywords(", "");
            json = json.substring(0, json.length - 1);
            json = JSON.parse(json);
            this.items = json.findItemsByKeywordsResponse[0].searchResult[0].item;
        } else if (data.Item){
            this.items = [data];
        } else {
    	     json = data;
             this.items = json.itemSummaries;
        }
		this.onComplete(this.items);
    }
    //------------------------------------------------
    private make_call_CFG() {
        let method:string;
        let headers:object;
        if (!this.sortorder) {
            this.single_item_url_CFG();
            this.headers = {
                'Content-Type':"application/json"
            }
            this.make_call();
        } else if (this.sortorder.indexOf("Price") > -1) {
            this.sort_by_price_url_CFG();
            method = "get";
            this.get_token(this.make_call);
        } else if (this.sortorder.indexOf("EndTime") > -1) {
            this.sort_by_enddate_url_CFG();
            this.make_call();
        }
    }
    //------------------------------------------------
    private single_item_url_CFG():string {
        let url = "http://open.api.ebay.com/shopping?";
        url += "callname=GetSingleItem";
        url += "&responseencoding=JSON";
        url += "&appid="+this.app_id;
        url += "&siteid=0";
        url += "&version=967";
        url += "&ItemID="+this.item_id;
        return this.url = url;
    }
    //------------------------------------------------
    private sort_by_enddate_url_CFG():string {
        let url = "http://svcs.ebay.com/services/search/FindingService/v1";
	    url += "?OPERATION-NAME=findItemsByKeywords";
	    url += "&SERVICE-VERSION=1.0.0";
	    url += "&SECURITY-APPNAME=wilmerab-Discover-PRD-1dfed633a-dc292d26";
	    url += "&GLOBAL-ID=EBAY-US";
	    url += "&RESPONSE-DATA-FORMAT=JSON";
	    url += "&callback=_cb_findItemsByKeywords";
	    url += "&REST-PAYLOAD";
	    if (this.sortorder) {
            this.sortorder_final = this.sortorder;
            if (this.sortorder === "EndTimeSoonest") {
                this.sortorder_final = "EndTimeSoonest";
            }
            url += "&sortOrder="+this.sortorder_final;
        }
	    url += "&keywords=" + this.keywords;
	    url += "&paginationInput.entriesPerPage=8";
        url += "&paginationInput.pageNumber="+this.page_number;
	    url += this.filter_CFG();
        return this.url = url;
    }
    //------------------------------------------------
    private get_token(callback:any) {
        axios.request({
            url: this.proxy_url + "https://api.ebay.com/identity/v1/oauth2/token",
            method: "post",
            headers:{
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization":"Basic d2lsbWVyYWItRGlzY292ZXItUFJELTFkZmVkNjMzYS1kYzI5MmQyNjpQUkQtZGZlZDYzM2FlZGE1LTczMjUtNDQ5My1hYzUxLWRkY2Y="
            },
            params: {
                grant_type: 'client_credentials',
                scope: 'https://api.ebay.com/oauth/api_scope'
            }
            }).then(res => {
                this.token = res.data.access_token;
                callback();
            }).catch(error => {
                console.log(error);
        })
    }
    //------------------------------------------------
    private sort_by_price_url_CFG():string {
        let url = "https://api.ebay.com/buy/browse/v1/item_summary/search?";
        url += "q="+this.keywords;
        url += "&offset="+(this.page_number-1) * this.limit;
        url += "&limit="+this.limit;
        if (this.sortorder) {
            this.sortorder_final = this.sortorder;
            if (this.sortorder === "CurrentPriceCheapest") {
                this.sortorder_final = "CurrentPriceHighest";
                url += "&sort=price";
            } else {
                url += "&sort=-price";
            }
        }
	    return this.url = url;
    }
    //------------------------------------------------
    private get_headers():object {
        return this.headers = {
            'Content-Type':"application/json",
            "Authorization":"Bearer "+this.token
        };
    }
    //------------------------------------------------
    private make_call = () => {
        if (this.method === "get" && !this.headers["Content-Type"]) this.get_headers();
		axios({
			method: this.method,
			url: this.proxy_url + this.url,
            headers: this.headers
		})
		.then(response => {
			this.complete(response.data);
		})
		.catch(err => console.log(err));
    }
    //------------------------------------------------
    private filter_CFG():string {
    	const filterarray = [
			/*{
				name:"MaxPrice",
				value:"25",
				paramName:"Currency",
				paramValue:"USD"
			},*/
			{
				name:"FreeShippingOnly",
				value:"true",
				paramName:"",
				paramValue:""
			},
			{
				name:"ListingType",
				value:["AuctionWithBIN", "FixedPrice", "StoreInventory"],
				paramName:"",
				paramValue:""
			},
		];
		// Define global variable for the URL filter
		this.urlfilter = "";
		// Execute the function to build the URL filter
		this.buildURLArray(filterarray);
		return this.urlfilter;
    }
    //------------------------------------------------
    private buildURLArray(filterarray: any[]) {

		// Iterate through each filter in the array
		for(let i=0; i<filterarray.length; i++) {
			//Index each item filter in filterarray
			const itemfilter = filterarray[i];
			// Iterate through each parameter in each item filter
			for(const index in itemfilter) {
				// Check to see if the paramter has a value (some don't)
				if (itemfilter[index] !== "") {
					if (itemfilter[index] instanceof Array) {
						for(let r=0; r<itemfilter[index].length; r++) {
							const value = itemfilter[index][r];
							this.urlfilter += "&itemFilter\(" + i + "\)." + index + "\(" + r + "\)=" + value ;
						}
					} else {
						this.urlfilter += "&itemFilter\(" + i + "\)." + index + "=" + itemfilter[index];
					}
				}
			}
		}
	}  // End buildURLArray() function
}
export default Ebay_cls;