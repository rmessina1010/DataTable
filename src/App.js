import MainComponent from './components/external';
function App() {
  return (
    <MainComponent
      url='https://sharelist.raymessinadesign.com/service.php'
      dataT={{
        ascClass: 'sort-asc',
        descClass: 'sort-desc',
        tableAttrs: { className: 'sample-table' },
        sortMap: { GLIID: true, GLIOrd: true, QTY: true, Needed: true },
        types: { image: 'img', a: 'html', email: "raw" },
        rClick: (a) => alert(a.ItemName),
        preProcess: (a) => { alert('preprocessor ran successfully'); return a; },
        rendCols: { address: (x, y) => x[y].city ? x[y].city : x[y], company: (x, y) => x[y].name ? x[y].name : x[y], email: (x, y) => <a href={"mailto:" + x[y]}>{x[y]}</a> }
      }}
    />
  )
}

export default App;
