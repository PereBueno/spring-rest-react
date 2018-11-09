package com.pbueno.learning.web.react.persistence;

import com.pbueno.learning.web.react.model.Employee;
import org.springframework.data.repository.CrudRepository;

public interface EmployeeRepository extends CrudRepository<Employee, Long> {
}
