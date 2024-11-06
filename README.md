# Discovery - Ebay API Test

#### Criteria:
Landing page has:
+ A featured auction
+ 10 additional auctions, listed by “ending soonest”
+ User needs to have a means to sort auctions; ending soonest, highest price, cheapest price
+ Upon selection of an auction, a page should show that auction w/ specific details

## Tech Stack:
+ **Webpack** for bundling

+ Code written in **TypeScript**, and **React** (tsx)

+ Linting accomplished with **tslint**

+ **Redux** Integrated for state management

+ Developed using **ES6**
Advanced React patterns utilized, **Higher-order component** (src/views/home/Item.tsx and src/views/home/WithCountdown), and **Render props**

#### Additional Features
+ Countdown for Items with active bids, also they animate out when countdown over cause items that are left over to move up.
+ LazyLoading Items
Simple Responsive Design
+ Heroku CORS were giving me problems so I built my own Nginx cors server to gain wide allow-access-control and smoothly obtain ebay api data.


## Install


`git clone https://github.com/awwthentic1234/discovery-ebay-auction-test.git`

`cd discovery-auction_test`

`npm install`

##### Required Dependcies
+ webpack
+ webpack-cli
+ webpack-dev-server
+ http-server


`npm i -g webpack`

`npm i -g webpack-cli`

`npm i -g webpack-dev-server`

`npm i -g http-server`

## Usage

##### To start up webpack-dev-server:

`npm start`

##### To build webpack production build then start up a node server on port - 1235:

`npm run prod-server`

##### To start up a node server on port - 1235:

`npm run server`

## Journey-Timeline (Google Document)

Heres a [link](https://docs.google.com/document/d/1JRnSMgmzRS1DgjWwZfKg5bfZ9UVkEuups51w7Q1rPsc/edit?usp=sharing) to a google doc that documents barriers I came across during the building process and how I went about conquering them.


## License

MIT © Wilmer Abreu
