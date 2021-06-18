import DataTable from './components/datatable';
function App() {
  return (
    <DataTable
      url='https://sharelist.raymessinadesign.com/service.php'
      ascClass='sort-asc'
      descClass='sort-desc'
      tableAttrs={{ class: 'sample-table' }}
      sortMap={{ GLIID: true, GLIOrd: true, QTY: true, Needed: true }}
      types={{ image: 'img' }}
      rClick={(a) => alert(a.ItemName)}
    />
  )
}

export default App;
