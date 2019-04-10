import React, { useState } from 'react'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { graphql } from 'gatsby'

import { normalize as normalizeDataSetAction} from '../../../state/reducers/data-sets'
import {
	REVENUES_FISCAL_YEAR,
	BY_ID, BY_COMMODITY,
	BY_STATE, BY_COUNTY,
	BY_LAND_CATEGORY,
	BY_LAND_CLASS,
	BY_REVENUE_TYPE,
	BY_FISCAL_YEAR
} from '../../../state/reducers/data-sets'

import * as CONSTANTS from '../../../js/constants'

import Link from '../../../components/utils/temp-link'
import utils from '../../../js/utils'

import styles from './FederalRevenue.module.scss'
import theme from '../../../css-global/base-theme.module.scss'

import DefaultLayout from '../../../components/layouts/DefaultLayout'
import Breadcrumb from '../../../components/navigation/Breadcrumb'
import {DownloadDataLink} from '../../../components/layouts/icon-links/DownloadDataLink'
import Toggle from '../../../components/selectors/Toggle'
import DropDown from '../../../components/selectors/DropDown'
import Select from '../../../components/selectors/Select'
import FilterTable from '../../../components/tables/FilterTable'

const PAGE_TITLE = "Federal Revenue | Natural Resources Revenue Data"
const TOGGLE_VALUES = {
  Year: 'year',
  Month: 'month'
}

const DEFAULT_GROUP_BY_INDEX = 0;

const GROUP_BY_OPTIONS = {
	'Commodity': BY_COMMODITY, 
	'Location': BY_STATE, 
	'Source': BY_LAND_CATEGORY, 
	'Land owner': BY_LAND_CLASS, 
	'Revenue type': BY_REVENUE_TYPE
};
const ADDITIONAL_COLUMN_OPTIONS = {
	'State/Offshore region': ['State','OffshoreRegion'],
	'Source': ['LandCategory'],
	'Land owner': ['LandClass'],
	'Revenue type': ['RevenueType']
};
//const ADDITIONAL_COLUMN_OPTIONS = ['State/offshore region', 'Source', 'Land owner', 'Revenue type'];

class FederalRevenue extends React.Component {

	constructor(props) {
		super(props);
		this.hydrateStore();
	}

	state = {
		timeframe: TOGGLE_VALUES.Year,
		yearOptions: [],
		filter: {
			groupBy: Object.keys(GROUP_BY_OPTIONS)[DEFAULT_GROUP_BY_INDEX],
			years: []
		},
		additionalColumnOptions: [],
		additionalColumns: []
	}

	componentWillReceiveProps (nextProps) {
		let yearOptions = Object.keys(nextProps[REVENUES_FISCAL_YEAR][BY_FISCAL_YEAR]);

	  this.setState({ ...nextProps, 
	  	filter:{...this.state.filter, years:(nextProps.selectedYears || yearOptions.slice(Math.max(yearOptions.length - 3, 1))) }, 
	  	yearOptions: yearOptions })
	}

	getTableColumns = () => {
		let columns = [];
		let {filter} = this.state;

		columns.push({ id: filter.groupBy, numeric: false, label: filter.groupBy, cellRender: commodityCellRender});

		this.state.additionalColumns.forEach(column => columns.push({ id: column, numeric: false, label: column }))

		filter.years.sort().forEach(year => columns.push({ id: 'fy-'+year, numeric: false, label: year }))

		return columns;
	}

	getTableData = () => {
		let dataSet = this.state[REVENUES_FISCAL_YEAR];
		let dataSetGroupBy = this.state[REVENUES_FISCAL_YEAR][GROUP_BY_OPTIONS[this.state.filter.groupBy]];

		let tableData = Object.keys(dataSetGroupBy).map((name) => {

			let tableRow = [name]

			let sums = {}

			let additionalColumnsRow = {};

			// sum all revenues
			dataSetGroupBy[name].map((dataId) => {
				let data = dataSet[BY_ID][dataId];

				// filter by selected years
				if( this.state.filter.years.includes(data.FiscalYear) ) {
					sums[data.FiscalYear] = (sums[data.FiscalYear])? sums[data.FiscalYear]+data.Revenue : data.Revenue;

					this.state.additionalColumns.forEach((additionalColumn) => {
						// Get the data columns related to the column in the table. Could have multiple data source columns mapped to 1 table column
						let dataColumns = ADDITIONAL_COLUMN_OPTIONS[additionalColumn];

						dataColumns.map(column => {
							let newValue = data[column];

							if(additionalColumnsRow[additionalColumn] === undefined) {
								additionalColumnsRow[additionalColumn] = [];
							}
							if(newValue !== null && !additionalColumnsRow[additionalColumn].includes(newValue)) {
								additionalColumnsRow[additionalColumn].push(newValue)
							}						
						})
					})
				}
			})

			// If no revenue data is found then ignore this row
			if(Object.keys(sums).length > 0) {

				let sumsToArray = this.state.filter.years.map(year => utils.formatToDollarInt(sums[year]) )

				Object.keys(additionalColumnsRow).forEach(column => {
					let rowData = (additionalColumnsRow[column].length > 0)? additionalColumnsRow[column].join(", ") : "-"
					tableRow.push(rowData);
				})

				return tableRow.concat(sumsToArray);
			}


		});

		// Filter out rows that were undefined due to not having any revenue data for the selected years
		return tableData.filter(row => row !== undefined);
	}

	setTimeframe = () => {

	}

	setYearsFilter(values) {
 		this.setState({filter:{...this.state.filter, years:values.sort()} })
	}

	setGroupByFilter(value) {
		this.setState({filter:{...this.state.filter, groupBy:value} })
	}

	setAdditionalColumns(value) {
		this.setState({additionalColumns:value})
	}
  /**
   * Add the data to the redux store to enable
   * the components to access filtered data using the
   * reducers
   **/
  hydrateStore  = () => {
  	let data = this.props.data;
    this.props.normalizeDataSet([
      { key: REVENUES_FISCAL_YEAR, 
      	data: data.allRevenues.data, 
      	groups: [
      		{
      			key: BY_COMMODITY, 
      			groups: data.allRevenuesGroupByCommodity.group,
      		},
      		{
      			key: BY_STATE, 
      			groups: data.allRevenuesGroupByState.group,
      		},
      		{
      			key: BY_COUNTY, 
      			groups: data.allRevenuesGroupByCounty.group,
      		},
      		{
      			key: BY_LAND_CATEGORY, 
      			groups: data.allRevenuesGroupByLandCategory.group,
      		},
      		{
      			key: BY_LAND_CLASS, 
      			groups: data.allRevenuesGroupByLandClass.group,
      		},
      		{
      			key: BY_REVENUE_TYPE,
      			groups: data.allRevenuesGroupByRevenueType.group,
      		},
      		{
      			key: BY_FISCAL_YEAR,
      			groups: data.allRevenuesGroupByFiscalYear.group
      		}
      	]
      },
    ])
  }

	render() {
		let {timeframe, yearOptions} = this.state;
		//console.log(this.state)
		return (
			<DefaultLayout>
	      <Helmet
	        title={PAGE_TITLE}
	        meta={[
	          // title
	          { name: 'og:title', content: PAGE_TITLE },
	          { name: 'twitter:title', content: PAGE_TITLE },
	        ]} />
	      <section className='layout-content container-page-wrapper container-margin'>
					<Breadcrumb crumbs={[{to:'/explore', name:'Explore data'}]} />

					<h1>Federal Revenue Data</h1>

					<section className={styles.descriptionContainer+" slab-delta "}>
						<div className="ribbon-hero-description">
							When companies lease lands to extract natural resources on federal lands and waters, they pay fees to lease the land and on the resources that are produced. This non-tax revenue is collected and reported by the Office of Natural Resources Revenue (ONRR).
						</div>
						<div className="container-left-6">
							Leasing<br/>
							Companies bid on and lease lands and waters from the federal government.  They pay a bonus when they win a lease and rent until resource production begins.
						</div>
						<div className="container-right-6">
							Production<br/>
							Once enough resources are produced to pay royalties, the leaseholder pays royalties and other fees to the federal government.
						</div>
					</section>

					<div className={styles.downloadLinkContainer}>
						<DownloadDataLink to={"/downloads"}>Downloads and documentation</DownloadDataLink>
					</div>

					<h2 className={theme.sectionHeaderUnderline}>Revenue data</h2>

					<div className={styles.filterContainer}>
						<div>
							<div className={styles.filterLabel}>Timeframe:</div>
							<Toggle 
								action={this.setTimeframe}
								buttons={[{ key: TOGGLE_VALUES.Year, name: 'Yearly', default: (timeframe === TOGGLE_VALUES.Year) },
											  { key: TOGGLE_VALUES.Month, name: 'Monthly', default: (timeframe === TOGGLE_VALUES.Month) }]}>
							</Toggle>
						</div>
						{yearOptions &&
							<div>
								<div className={styles.filterLabel}>Year(s):</div>
								<Select
									multiple
									dataSetId={REVENUES_FISCAL_YEAR}
							    options={yearOptions}
							    sortType={'descending'}
							    selectedOption={this.state.filter.years}
							    onChangeHandler={this.setYearsFilter.bind(this)}
							  >
							  </Select>
							</div>
						}

						<div>
							<div className={styles.filterLabel}>Organize By:</div>
							<DropDown
								sortType={'none'}
						    options={Object.keys(GROUP_BY_OPTIONS)}
						    callback={this.setGroupByFilter.bind(this)}
						    defaultOptionIndex={DEFAULT_GROUP_BY_INDEX}
						  >
						  </DropDown>
						</div>

						<div>
							<div className={styles.filterLabel}>Additional Column:</div>
							<Select
								multiple
						    options={Object.keys(ADDITIONAL_COLUMN_OPTIONS)}
						    onChangeHandler={this.setAdditionalColumns.bind(this)}
						  >
						  </Select>
						</div>
					</div>
					{this.state[REVENUES_FISCAL_YEAR] &&
						<div>
							<FilterTable data={this.getTableData()} columns={this.getTableColumns()}/>
						</div>
					}

				</section>
			</DefaultLayout>
		)

	}

}

export default connect(
  state => ({
  	[REVENUES_FISCAL_YEAR]: state[CONSTANTS.DATA_SETS_STATE_KEY][REVENUES_FISCAL_YEAR],
  }),
  dispatch => ({ normalizeDataSet: dataSets => dispatch(normalizeDataSetAction(dataSets)),
  })
)(FederalRevenue)

const commodityCellRender = (data) => {
	return data;
}

export const query = graphql`
  query FederalRevenuesPageQuery {
		allRevenues:allResourceRevenues (filter:{FiscalYear:{ne:null}}, sort: {fields: [FiscalYear], order: DESC}) {
		  data:edges {
		    node {
		    	id
		      Revenue
		      RevenueType
		      FiscalYear
		      Commodity
		      LandCategory
		      LandClass
		      County
		      State
		      RevenueDate
		      OffshoreRegion
		    }
		  }
		}
	  allRevenuesGroupByCommodity: allResourceRevenues(filter: {FiscalYear: {ne: null}}, sort: {fields: [FiscalYear], order: DESC}) {
	    group(field: Commodity) {
	      id:fieldValue
	      data:edges {
	        node {
	          id
	        }
	      }
	    }
	  }
	  allRevenuesGroupByState: allResourceRevenues(filter: {FiscalYear: {ne: null}}, sort: {fields: [FiscalYear], order: DESC}) {
	    group(field: State) {
	      id:fieldValue
	      data:edges {
	        node {
	          id
	        }
	      }
	    }
	  }
	  allRevenuesGroupByCounty: allResourceRevenues(filter: {FiscalYear: {ne: null}}, sort: {fields: [FiscalYear], order: DESC}) {
	    group(field: County) {
	      id:fieldValue
	      data:edges {
	        node {
	          id
	        }
	      }
	    }
	  }
	  allRevenuesGroupByLandCategory: allResourceRevenues(filter: {FiscalYear: {ne: null}}, sort: {fields: [FiscalYear], order: DESC}) {
	    group(field: LandCategory) {
	      id:fieldValue
	      data:edges {
	        node {
	          id
	        }
	      }
	    }
	  }
	  allRevenuesGroupByLandClass: allResourceRevenues(filter: {FiscalYear: {ne: null}}, sort: {fields: [FiscalYear], order: DESC}) {
	    group(field: LandClass) {
	      id:fieldValue
	      data:edges {
	        node {
	          id
	        }
	      }
	    }
	  }
	  allRevenuesGroupByRevenueType: allResourceRevenues(filter: {FiscalYear: {ne: null}}, sort: {fields: [FiscalYear], order: DESC}) {
	    group(field: RevenueType) {
	      id:fieldValue
	      data:edges {
	        node {
	          id
	        }
	      }
	    }
	  }
	  allRevenuesGroupByFiscalYear: allResourceRevenues(filter: {FiscalYear: {ne: null}}, sort: {fields: [FiscalYear], order: DESC}) {
	    group(field: FiscalYear) {
	      id:fieldValue
	      data:edges {
	        node {
	          id
	        }
	      }
	    }
	  }
  }
`