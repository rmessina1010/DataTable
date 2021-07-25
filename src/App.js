import MainComponent from './components/external';
function App() {
  return (
    <MainComponent
      url='https://sharelist.raymessinadesign.com/service.php'
      dataT={{
        ascClass: 'sort-asc',
        descClass: 'sort-desc',
        tableAttrs: { className: 'sample-table' },
        links: { email: 'email', website: 'website' },
        sortMap: { GLIID: true, GLIOrd: true, QTY: true, Needed: true },
        types: { image: 'img', a: 'html' },
        rClick: (a) => alert('click function [ItemName]:' + a.ItemName),
        preProcess: (a) => { console.log('Preprocessor function ran successfully.'); return a; },
        rendCols: { address: (x, y) => x[y].city ? x[y].city : x[y], company: (x, y) => x[y].name ? x[y].name : x[y] }
      }}
    />
  )
}

export default App;
