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
        types: { image: 'img' },
        rClick: (a) => alert(a.ItemName)
      }}
    />
  )
}

export default App;
