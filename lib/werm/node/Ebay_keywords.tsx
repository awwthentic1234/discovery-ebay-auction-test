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
		return api.items;
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
    private proxy_url = 'https://cors-anywhere.herokuapp.com/';
    private urlfilter!: string;
    private url!: string;
    private onComplete!: (items: any[]) => void;
    private props!: prop;
    private page_number: number = 1;
    ///////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////
	//constructor
	///////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////
	public constructor(props: prop) {
		this.onComplete = props.onComplete;
		this.sortorder = props.sortorder;
        this.page_number = props.page_number || this.page_number;
		//this.onComplete = onComplete;
        // do something construct...
    }
    //------------------------------------------------
    public keywords_CFG(keywords: string) {
    	this.keywords = keywords;
    	this.url = this.keywords_url_cfg();
    	this.make_call(this.keywords_complete);
    }
    //------------------------------------------------
    public keywords_complete = (data: string) => {
    	let json: any = data.replace("/**/_cb_findItemsByKeywords(", "");
		json = json.substring(0, json.length - 1);
		json = JSON.parse(json);
		this.items = json.findItemsByKeywordsResponse[0].searchResult[0].item;
        if (this.sortorder == "CurrentPriceCheapest") this.items = this.items.reverse();
		this.onComplete(this.items);
    }
    //------------------------------------------------
    private keywords_url_cfg() {
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
            if (this.sortorder == "CurrentPriceCheapest") {
                this.sortorder_final = "CurrentPriceHighest"
            }
            url += "&sortOrder="+this.sortorder_final;
        }
	    url += "&keywords=" + this.keywords;
	    url += "&paginationInput.entriesPerPage=8";
        url += "&paginationInput.pageNumber="+this.page_number;
	    url += this.filter_CFG();
	    return url;
    }
    //------------------------------------------------
    private make_call(callback: (data: string) => void) {
		axios({
			method: 'post',
			url: this.proxy_url + this.url
		})
		.then(response => {
			callback(response.data);
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