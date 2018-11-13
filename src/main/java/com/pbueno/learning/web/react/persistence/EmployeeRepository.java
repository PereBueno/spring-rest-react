package com.pbueno.learning.web.react.persistence;

import com.pbueno.learning.web.react.model.Employee;
import org.springframework.data.repository.PagingAndSortingRepository;

public interface EmployeeRepository extends PagingAndSortingRepository<Employee, Long> {
}
