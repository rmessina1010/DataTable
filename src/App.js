import MainComponent from './components/external';
function App() {
  return (
    <MainComponent
      url='https://sharelist.raymessinadesign.com/service.php'
      dataT={{
        tableAttrs: { className: 'sample-table' },
        rClick: (a) => alert('click function [ItemName]:' + a.ItemName),
        rendCols: {
          address: x => x.city ,
          company: x => x.name
        }
      }}
    />
  )
}

export default App;
