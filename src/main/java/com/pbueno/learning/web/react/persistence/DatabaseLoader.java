package com.pbueno.learning.web.react.persistence;

import com.pbueno.learning.web.react.model.Employee;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DatabaseLoader implements CommandLineRunner {

    private final EmployeeRepository repository;

    @Autowired
    public DatabaseLoader(EmployeeRepository repository){
        this.repository = repository;
    }

    @Override
    public void run(String... args) throws Exception {
        repository.save(new Employee("Señor", "Misterio", "Es un misterio"));
        repository.save(new Employee("Señora", "Misterio", "Es otro misterio"));
        repository.save(new Employee("Señorita", "Misterio", "Es un misterio más pequeño"));
        repository.save(new Employee("Mr.", "Misterio", "He is a misterio"));
        repository.save(new Employee("Mrs.", "Misterio", "She is a misteria"));
        repository.save(new Employee("Lord", "Misterio", "Un misterio con cache"));
        repository.save(new Employee("Madamme", "Misterio", "Una misterio que regenta un lupanar"));
        repository.save(new Employee("Monseñor", "Misterio", "Un misterio místico"));

    }
}
