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
        types: { image: 'img', a: 'html' },
        rClick: (a) => alert(a.ItemName),
        preProcess: (a) => { alert('preprocessor ran successfully'); return a; },
        rendCols: { c: (x, y) => (x[y] || 0) * 10 }
      }}
    />
  )
}

export default App;
