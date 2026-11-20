package com.j21.telecom.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.j21.telecom.entity.Role;
import com.j21.telecom.service.RoleService;

@RestController
@RequestMapping("/api/roles")
public class RoleController {
    private final RoleService roleService;
    public RoleController(RoleService roleService) { this.roleService = roleService; }
    @GetMapping public ResponseEntity<List<Role>> getAllRoles() { return ResponseEntity.ok(roleService.getAllRoles()); }
    @GetMapping("/{roleId}") public ResponseEntity<Role> getRoleById(@PathVariable Long roleId) { return ResponseEntity.ok(roleService.getRoleById(roleId)); }
}
