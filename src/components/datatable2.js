import { useState , useEffect, createContext, useContext} from "react";

const TableContext = createContext();

function TCell({th, action, col, className, children}) {
	const doAction= th && typeof action === 'function' ? ()=>action(col) : undefined;
    return (th ? <th onClick={doAction} className={className}>{children} </th> : <td className={className}>{children}</td>);
}

function TRow({clickSchemas, renderSchemas, isHead=false, rowIndex, activeCol, skipClick, dirClass, skipEmpty, aux={} }) {
 	const { schema, theData:data, setTheData:setter} = useContext (TableContext);
	const doAction= !isHead && typeof clickSchemas === 'function' ? ()=>clickSchemas({data, rowIndex, activeCol, setter, aux}) : undefined;
	let classes = '';
	const kprefix = isHead ? 'th' : 'td';
	const noClick = Array.isArray (skipClick) ? skipClick : [];
	if (!isHead && skipEmpty){
		if ( !Object.keys(data[rowIndex])?.length || (schema.filter(s => data[rowIndex][s] !== undefined).length === 0)) {return null}
	}
    const cells = schema.map( c =>{
		const clickSchema = (isHead && typeof clickSchemas === 'function' && !noClick.includes(c)) ? clickSchemas : undefined;
		classes = (isHead && c === activeCol) ? ` ${dirClass}` : '';
		const content = isHead ? c : data[rowIndex][c];
		const renderSchema = typeof renderSchemas === 'function' ? renderSchemas :
					(typeof renderSchemas?.[c] === 'function' ? renderSchemas[c] : undefined);
		return ( <TCell
				th= {isHead}
				key= {`${kprefix}_${c}`}
				action= {clickSchema}
				className= {classes}
				col={c}
			>
		 		{ renderSchema ? renderSchema(content, c, rowIndex, data ) : content }
			</TCell>);
	});
    return <tr onClick={doAction}>{cells}</tr>;
}

export function DataTable2({keyCol, schema, headRenderSchemas, renderSchemas, data, skipClick, rowAction, tableAttrs, skipEmpty, sortSchemas, aux={}}){
 	const [theData, setTheData]= useState(data);
    const [sortKey,setSortKey]= useState(null);
    const [dir,setDir]= useState(1);

	useEffect(() => {setTheData(data);}, [data]);

 	const triggerSort=(col)=>{
			const getVal = typeof sortSchemas === 'function' ? sortSchemas :
			typeof sortSchemas?.[col] === 'function' ? sortSchemas[col] : v => v;
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

    return (<TableContext.Provider value={{ theData, setTheData, schema}}>
		<table {...tableAttrs}>
				<thead>
					<TRow
						renderSchemas={headRenderSchemas}
						isHead={true}
						clickSchemas={triggerSort}
						skipClick={skipClick}
						activeCol={sortKey}
						dirClass={dir>0 ?  'active down-arr' : 'active up-arr'}
					/>
				</thead>
				<tbody>{theData.map( (row,i) => {
					return <TRow
						key={`key_${ (keyCol in row) ? JSON.stringify(row[keyCol]) : i}`}
						renderSchemas={renderSchemas}
						clickSchemas={rowAction}
						rowIndex={i}
						skipEmpty={skipEmpty}
				/>})}</tbody>
			</table>
		</TableContext.Provider>);
}

export default DataTable2;
