const React = require('react');
const ReactDOM = require ('react-dom');
const client = require('./client/client');
const follow = require('./follow');
const root = '/api';

class App extends React.Component {

	constructor(props) {
		super(props);
		this.state = {employees: [], pageSize: 5, links:[], attributes:[]};
		this.onCreate = this.onCreate.bind(this);
		this.onDelete = this.onDelete.bind(this);
		this.onNavigate = this.onNavigate.bind(this);
	}

	componentDidMount() {
		this.loadFromServer(this.state.pageSize);
	}

    loadFromServer(pageSize){
        follow(client, root, [
        		{rel: 'employees', params: {size: pageSize}}]
        	).then(employeeCollection => {
        		return client({
        			method: 'GET',
        			path: employeeCollection.entity._links.profile.href,
        			headers: {'Accept': 'application/schema+json'}
        		}).then(schema => {
        			this.schema = schema.entity;
        			return employeeCollection;
        		});
        	}).done(employeeCollection => {
        		this.setState({
        			employees: employeeCollection.entity._embedded.employees,
        			attributes: Object.keys(this.schema.properties),
        			pageSize: pageSize,
        			links: employeeCollection.entity._links});
        	});
    };

	render() {
		return (
		    <div>
		    <CreateDialog attributes={this.state.attributes} onCreate={this.onCreate}/>
			<EmployeeList employees={this.state.employees}
			    links={this.state.links}
			    pageSize={this.state.pageSize}
			    onDelete={this.onDelete}
			    onNavigate={this.onNavigate}/>
			</div>
		)
	};

    onCreate(newEmployee){
            follow(client, root, ['employees']).then(employeeCollection => {
                return client({
                   method: 'POST',
                   path: employeeCollection.entity._links.self.href,
                   entity: newEmployee,
                   headers: {'Content-Type': 'application/json'}
                });
            }).then(response => { return follow(client, root, [{
                rel:'employees', params:{size: this.state.pageSize}}])
            }).done(response => {
                if (typeof response.entity._links.last !== "undefined")
                    this.onNavigate(response.entity._links.last.href);
                else
                    this.onNavigate(response.entity._links.self.href);
            });
        };

     onNavigate(uri){
        client({method:'GET', path: uri}).done(employeeCollection => {
            this.setState({
                employees: employeeCollection.entity._embedded.employees,
                attributes: this.state.attributes,
                pageSize: this.state.pageSize,
                links: employeeCollection.entity._links
            })
        })
     };

    onDelete(employee) {
        console.log("Deleted" + employee.firstName + " " + employee.lastName);
    	client({method: 'DELETE', path: employee._links.self.href}).done(response => {
    		this.loadFromServer(this.state.pageSize);
    	});
    }
}

class EmployeeList extends React.Component{
    constructor(props){
        super(props);
        this.handleNavFirst = this.handleNavFirst.bind(this);
        this.handleNavPrev = this.handleNavPrev.bind(this);
   		this.handleNavNext = this.handleNavNext.bind(this);
   		this.handleNavLast = this.handleNavLast.bind(this);
   		//this.onDelete = this.onDelete.bind(this);
    }
    render(){
        const employees = this.props.employees.map(employee =>
            <Employee key={employee._links.self.href} employee={employee} onDelete={this.props.onDelete}/>);
        const navLinks = [];
        	if ("first" in this.props.links) {
        		navLinks.push(<button key="first" onClick={this.handleNavFirst}>&lt;&lt;</button>);
        	}
        	if ("prev" in this.props.links) {
        		navLinks.push(<button key="prev" onClick={this.handleNavPrev}>&lt;</button>);
        	}
        	if ("next" in this.props.links) {
        		navLinks.push(<button key="next" onClick={this.handleNavNext}>&gt;</button>);
        	}
        	if ("last" in this.props.links) {
        		navLinks.push(<button key="last" onClick={this.handleNavLast}>&gt;&gt;</button>);
        	}
        return (
            <div>
            <input ref="pageSize" defaultValue={this.props.pageSize} onInput={this.handleInput}/>
            <table>
                <tbody>
                    <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Description</th>
                     </tr>
                     {employees}
                 </tbody>
             </table>
             <div>
                {navLinks}
             </div>
             </div>
        );
    }

    handleNavFirst(e){
        	e.preventDefault();
        	this.props.onNavigate(this.props.links.first.href);
        }

        handleNavPrev(e) {
        	e.preventDefault();
        	this.props.onNavigate(this.props.links.prev.href);
        }

        handleNavNext(e) {
        	e.preventDefault();
        	this.props.onNavigate(this.props.links.next.href);
        }

        handleNavLast(e) {
        	e.preventDefault();
        	this.props.onNavigate(this.props.links.last.href);
        }

}

class Employee extends React.Component{
    constructor(props){
        super(props);
        this.handleDelete = this.handleDelete.bind(this);
    }
    handleDelete(){
        this.props.onDelete(this.props.employee);
    }

	render() {
		return (
			<tr>
				<td>{this.props.employee.firstName}</td>
				<td>{this.props.employee.lastName}</td>
				<td>{this.props.employee.description}</td>
				<td><button onClick={this.handleDelete}>Delete</button></td>
			</tr>
		)
	}
}

class CreateDialog extends React.Component{
    constructor(props){
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(e){
        e.preventDefault();
        const newEmployee={};
        this.props.attributes.forEach(attr => {newEmployee[attr] = ReactDOM.findDOMNode(this.refs[attr]).value.trim()});
        this.props.onCreate(newEmployee);
        this.props.attributes.forEach(attribute => {ReactDOM.findDOMNode(this.refs[attribute]).value = '';});
        window.location="#";
    }

    render(){
        console.log(this.props.attributes);
        console.log(this.props);
        const inputs = this.props.attributes.map(attr =>
            <p key={attr}>
                <input type="text" placeholder={attr} ref={attr} className="field"/>
            </p>
            );

        return(
            <div>
                <a href="#createEmployee">Create</a>
                <div id="createEmployee" className="modalDialog">
                    <div>
                        <a href="#" title="Close" className="close">X</a>
                        <h2>Create new employee</h2>
                        <form>
                            {inputs}
                            <button onClick={this.handleSubmit}>Create</button>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}

// Render the list!
ReactDOM.render(<App/>, document.getElementById('react'));