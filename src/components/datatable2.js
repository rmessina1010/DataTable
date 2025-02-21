import { useState , useEffect, createContext, useContext} from "react";

const TableContext = createContext({setter:()=>2});

function TCell({th, action, col, className, children, activeCol, rowIndex}) {
	const { theData:data  , aux, sortSchemas, setter} = useContext (TableContext);
	const Tag = th ? 'th' : 'td';
	const attributes =  {className};
	const doAction = Array.isArray(action) ? action[0] : action;
	const bubble   = Array.isArray(action) ? action[1] : undefined;
	if(typeof doAction === 'function') {
			attributes.onClick = !th ? e =>{
				if (!bubble) { e.stopPropagation(); }
				doAction({e, content: data[rowIndex][col], data, col, rowIndex, setter, aux, activeCol, sortSchemas });
			} : attributes.onClick=()=>doAction(col);
	}
    return <Tag {...attributes}>{children} </Tag>;
}

function TRow({rowClicks, renderSchemas, isHead=false, rowIndex, skipClick, dirClass, skipEmpty,  activeCol}){
 	const { schema, theData:data, setter, aux, cellClicks, sortSchemas } = useContext (TableContext);
	const doAction= !isHead && typeof rowClicks === 'function' ? (e)=>rowClicks({e, content:data[rowIndex], data, rowIndex, activeCol, setter, aux, sortSchemas}) : undefined;
	const kprefix = isHead ? 'th' : 'td';
	const noClick = Array.isArray (skipClick) ? skipClick : [];
	if (!isHead && skipEmpty){
		if ( !Object.keys(data[rowIndex])?.length || (schema.filter(s => data[rowIndex][s] !== undefined).length === 0)) {return null}
	}
    const cells = schema.map( c =>{
		const cellClick = (isHead && !noClick.includes(c)) ? rowClicks
						  :(!isHead && (typeof cellClicks?.[c] === 'function' || Array.isArray(cellClicks?.[c]))) ? cellClicks[c]
						  :undefined;
		const classes = (isHead && c === activeCol) ? ` ${dirClass}` : '';
		const content = isHead ? c : data[rowIndex][c];
		const renderSchema = typeof renderSchemas === 'function' ? renderSchemas :
					(typeof renderSchemas?.[c] === 'function' ? renderSchemas[c] : undefined);
		return ( <TCell
				th= {isHead}
				key= {`${kprefix}_${c}`}
				action= {cellClick}
				className= {classes}
				col= {c}
				activeCol= {activeCol}
				rowIndex = {rowIndex }
			>
		 		{ renderSchema ? renderSchema(content, c, rowIndex, data, setter) : content }
			</TCell>);
	});
    return <tr onClick={doAction}>{cells}</tr>;
}

export function DataTable2({keyCol, schema, headRenderSchemas, renderSchemas, data, skipClick, rowAction, tableAttrs, skipEmpty, sortSchemas, aux={}, filterSchemas, clickSchemas}){
 	const [theData, setTheData]= useState(data);
    const [sortKey,setSortKey]= useState(null);
    const [dir,setDir]= useState(1);

	useEffect(() => {setTheData(data);}, [data]);

	const valFinderFoo = (col)=>{
		if (typeof sortSchemas === 'function')  {return sortSchemas ;}
		if (typeof sortSchemas?.[col] === 'function')  return( sortSchemas[col])
		return v => v;
	}

	const filteredData = () => (typeof filterSchemas?.foo !== 'function' || filterSchemas.needle === '') ? theData
			: theData.reduce( (a, row, i) => { if( filterSchemas.foo( row, filterSchemas.col, filterSchemas.invert, valFinderFoo, filterSchemas.needle)){ a[i]=row} return a}, []);

 	const triggerSort=(col)=>{
			const getVal = valFinderFoo(col);
		    let ori = dir;
			if (col !== sortKey) {
				setSortKey(col);
				ori = 1;
			}
 			const sortedData = [...theData].sort((a, b) => {
				return getVal(a[col]) <= getVal(b[col]) ?  -1 * ori : ori ;
			});
			setTheData(sortedData);
			setDir(ori * -1);
		};

    return (<TableContext.Provider value={{ theData, setter:setTheData, schema, sortKey, aux, sortSchemas, cellClicks:clickSchemas }}>
		<table {...tableAttrs}>
				<thead>
					<TRow
						renderSchemas={headRenderSchemas}
						isHead={true}
						rowClicks={triggerSort}
						skipClick={skipClick}
						activeCol={sortKey}
						dirClass={dir>0 ?  'active down-arr' : 'active up-arr'}
					/>
				</thead>
				<tbody>{
					filteredData().map( (row,i) => {
					return <TRow
						key={`key_${ (keyCol in row) ? JSON.stringify(row[keyCol]) : i}`}
						renderSchemas={renderSchemas}
						rowClicks={rowAction}
						rowIndex={i}
						skipEmpty={skipEmpty}
				/>})}</tbody>
			</table>
		</TableContext.Provider>);
}

export default DataTable2;
