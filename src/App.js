import MainComponent from './components/external';
function App() {
  return (
    <MainComponent
      url='https://sharelist.raymessinadesign.com/service.php'
      dataT={{
        tableAttrs: { className: 'sample-table' },
        rClick: ({data, rowIndex}) => alert('click function [ItemName]:' + data[rowIndex].ItemName),
        rendCols: {
          address: x => x.city ,
          company: x => x.name
        },
        sortSchemas: {
          address: x => x.city ,
          company: x => x.name
        }
      }}
    />
  )
}

export default App;
