const isJson = (str) => {
  try {
    return JSON.parse(str);
  } catch (err) {
    return false;
  }
}
class Transactions extends React.Component {
  state = {
    transactions: [],
    formVals: { amount: 0, month: 1, customer: '' },
    monthTotals: {},
    customerTotals: {},
    errors: {},
    add: false,
    grandTotal: 0,
    mockData: false
  };
  constructor(...args) {
    super(...args);
    this.clearData = this.clearData.bind(this);
    this.updateForm = this.updateForm.bind(this);
    this.awardedPoints = this.awardedPoints.bind(this);
    this.addTransaction = this.addTransaction.bind(this);
    this.generateMockTransactions = this.generateMockTransactions.bind(this);
    this.initialization = this.initialization.bind(this);
    this.validateForm = this.validateForm.bind(this);
  }
  componentDidMount() {
    const data = isJson(localStorage.transactions);
    this.initialization(data || []);
  }
  clearData() {
    localStorage.clear();
    this.setState({
      transactions: [],
      formVals: { amount: 0, month: 1, customer: '' },
      monthTotals: {},
      customerTotals: {},
      errors: {},
      add: false,
      grandTotal: 0,
      mockData: false
    });
  }
  updateForm(e) {
    const formVals = { ...this.state.formVals };
    const errors = { ...this.state.errors };
    const name = e.target.name;
    const value = e.target.value;
    const type = e.target.type;
    formVals[name] = value;
    if (type === 'number') {
      formVals[name] = Number(value);
    }
    delete errors[name];
    this.setState({ formVals, errors });
  }
  awardedPoints(transaction) {
    let rewardPoints = 0;
    if (transaction > 50) {
      rewardPoints += (transaction > 100 ? 50 : transaction - 50) * 1;
    }
    if (transaction > 100) {
      rewardPoints += (transaction - 100) * 2;
    }
    return rewardPoints;
  }
  initialization(transactions) {
    const monthTotals = {};
    const customerTotals = {};
    transactions.forEach((transaction) => {
      if (!monthTotals[transaction.month]) {
        monthTotals[transaction.month] = {
          total: 0,
          transactions: []
        };
      }
      monthTotals[transaction.month].total += transaction.points || 0;
      monthTotals[transaction.month].transactions.push(transaction);
      if (!customerTotals[transaction.customer]) {
        customerTotals[transaction.customer] = 0;
      }
      customerTotals[transaction.customer] += transaction.points || 0;
    });
    const grandTotal = Object.values(monthTotals).reduce((a, b) => a + b.total, 0);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    this.setState({
      transactions,
      formVals: { amount: 0, month: 1, customer: '' },
      add: false,
      monthTotals,
      customerTotals,
      grandTotal,
      mockData: false
    })
  }
  generateMockTransactions() {
    const noOfUsers = Math.floor(Math.random() * 20 + 4);
    const randomUsers = [];
    for (let i = 0; i < noOfUsers; i++) {
      randomUsers.push(faker.name.firstName());
    }
    const randomData = [];
    for (let i = 0; i < this.state.noOfTransactions; i++) {
      const customer = randomUsers[Math.round(Math.random() * (randomUsers.length - 1))];
      const amount = Math.round(faker.finance.amount());
      const points = this.awardedPoints(amount);
      randomData.push({
        customer,
        amount,
        month: Math.floor(Math.random() * 3 + 1),
        points
      });
    }
    this.initialization(randomData);
  }
  addTransaction() {
    const values = this.state.formVals;
    if (this.validateForm(values)) {
      return;
    }
    values.points = this.awardedPoints(values.amount);
    const updatedTransactions = [...this.state.transactions, values];
    this.initialization(updatedTransactions)
  };
  validateForm(data) {
    const { errors } = this.state;
    const fields = Object.keys(data);
    for (let i = 0; i < fields.length; i++) {
      if (!data[fields[i]]) errors[fields[i]] = true;
    }
    const errorFields = Object.keys(errors);
    this.setState({ errors });
    return errorFields.length;
  };
  render() {
    const {
      formVals,
      errors,
      add,
      monthTotals,
      grandTotal,
      customerTotals,
      mockData,
      noOfTransactions
    } = this.state;
    const months = Object.keys(monthTotals);
    const customers = Object.keys(customerTotals);
    return <main className="row-block container-fluid position-relative">
      <div>
        <button className="mock-btn btn btn-primary" disabled={mockData || add} title="add new transaction" onClick={() => this.setState({ add: true })}>+</button>
        <div className="row pr-3 pl-3">
          <div className="col-12">
            <div className="block-2 justify-content-between">
              <div className="title">Store Transactions</div>
              <div className="float-right">
                <button className="btn btn-primary" disabled={add || mockData} onClick={() => this.setState({ mockData: true })}>Fake Data</button>
                <button className="btn btn-outline-danger" onClick={this.clearData}>Clear</button>
              </div>
            </div>
          </div>
          {mockData && <div className="col-md-12 col-lg-6">
            <div className="block-2">
              <div className="form-group w-50">
                <label># of Transactions</label>
                <input type="number" name="amount" className="form-control" value={noOfTransactions} onChange={(e) => this.setState({ noOfTransactions: e.target.value })} />
              </div>
              <button className="btn btn-primary" onClick={this.generateMockTransactions}>Create</button>
              <button className="btn btn-outline-danger" onClick={() => this.setState({ mockData: false })}>Cancel</button>
            </div>
          </div>}
          {add && <div className="col-md-12 col-lg-6">
            <div className="block-2">
              <div className="form-group">
                <label>Amount</label>
                <input type="number" name="amount" className="form-control" value={formVals.amount} onChange={this.updateForm} />
                {errors.amount && <small className="text-danger">required</small>}
              </div>
              <div className="form-group">
                <label>Customer Name</label>
                <input type="text" name="customer" className="form-control" value={formVals.customer} onChange={this.updateForm} />
                {errors.customer && <small className="text-danger">required</small>}
              </div>
              <div className="form-group">
                <label>Month</label>
                <select name="month" className="form-control" value={formVals.month} onChange={this.updateForm}>
                  {Array.from({ length: 3 }).map((i, m) => <option key={m} value={m + 1}>{moment(m + 1, 'MM').format('MMMM')}</option>)}
                </select>
                {errors.month && <small className="text-danger">required</small>}
              </div>
              <button className="btn btn-primary" onClick={this.addTransaction}>Add</button>
              <button className="btn btn-outline-danger" onClick={() => this.setState({ add: false, formVals: { amount: 0, month: 1, customer: '' } })}>Cancel</button>
            </div>
          </div>}
          <div className="col-12"/>
          {months.length ? <div className="col-12 col-lg-6" style={{ display: 'block' }}>
            <div className="block-2">
              <div className="form-group" style={{ width: '100%' }}>
                <label>Grand Total</label>
                <div className="form-control">{(grandTotal || 0).toLocaleString()}</div>
              </div>
              {months.map((m) => <div key={m} className="form-group w-auto">
                <label>{moment(m, 'MM').format('MMMM')}</label>
                <div className="form-control">{(monthTotals[m].total || 0).toLocaleString()}</div>
              </div>)}
            </div>
          </div> : null}
          {customers.length ? <div className="col-12 col-lg-6" style={{ display: 'block' }}>
            <div className="block-2">
              {customers.map((m) => <div key={m} className="form-group w-auto">
                <label>{m}</label>
                <div className="form-control">{(customerTotals[m] || 0).toLocaleString()}</div>
              </div>)}
            </div>
          </div> : null}
          <div className="col-12" />
          {months.map((m) => <div className="col-12 col-md-6 col-lg-4 col-xl-3" key={`month-${m}`}>
            <div className="block">
              <div style={{ marginBottom: '10px', fontSize: '15px', fontWeight: 'bolder' }}>
                {moment(m, 'MM').format('MMMM')}
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {(monthTotals[m].transactions || []).map((d, i) => <tr key={i}>
                    <td>{d.customer}</td>
                    <td>{d.amount.toLocaleString()}</td>
                    <td>{(d.points || 0).toLocaleString()}</td>
                  </tr>)}
                </tbody>
              </table>
            </div>
          </div>)}
        </div>
      </div>
    </main>;
  }
}
ReactDOM.render(
  <Transactions />,
  document.getElementById('root')
);