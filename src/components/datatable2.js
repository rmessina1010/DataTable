import { useState , useEffect} from "react";

function TCell({th, action, col, className, children}) {
	const doAction= th && typeof action === 'function' ? ()=>action(col) : undefined;
    return (th ? <th onClick={doAction} className={className}>{children} </th> : <td className={className}>{children}</td>);
}

function TRow({ data, schema, clickSchemas, renderSchemas, isHead=false, setter, rowIndex, activeCol, skipClick, dirClass, skipEmpty, aux={} }) {
 	const doAction= !isHead && typeof clickSchemas === 'function' ? ()=>clickSchemas(data, rowIndex, activeCol, setter, aux) : undefined;
	let classes = '';
	const kprefix = isHead ? 'th' : 'td';
	const noClick = Array.isArray (skipClick) ? skipClick : [];
	if (skipEmpty){
		if ( !Object.keys(data)?.length || (schema.filter(s => data[s] !== undefined).length === 0)) {return null}
	}
    const cells = schema.map( c =>{
		const clickSchema = (isHead && typeof clickSchemas === 'function' && !noClick.includes(c)) ? clickSchemas : undefined;
		classes = (isHead && c === activeCol) ? ` ${dirClass}` : '';
		const content = isHead ? c : data[c];
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

export function DataTable2({keyCol, schema, headRenderSchemas, renderSchemas, source, skipClick, rowAction, tableAttrs, skipEmpty, aux={}}){
 	const [theData, setTheData]= useState(source);
    const [sortKey,setSortKey]= useState(null);
    const [dir,setDir]= useState(1);

	useEffect(() => {setTheData(source);}, [source]);

 	const triggerSort=(col)=>{
		    let ori = dir;
			if (col !== sortKey) {
				setSortKey(col);
				ori = 1;
			}
 			const sortedData = [...theData].sort((a, b) => {
				return a[col] <= b[col] ?  -1 * ori : ori ;
			});
			setTheData(sortedData);
			setDir(ori * -1);
		};

    return (<table {...tableAttrs}>
				<thead>
					<TRow
						schema={schema}
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
						data={row}
						schema={schema}
						renderSchemas={renderSchemas}
						clickSchemas={rowAction}
						rowIndex={i}
						skipEmpty={skipEmpty}
				/>})}</tbody>
			</table>);
}

export default DataTable2;
