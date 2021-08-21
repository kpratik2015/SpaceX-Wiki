/// <reference types="cypress" />

import { randomInteger } from "../src/utils";

describe("Home", () => {
  it("should compare missions and exit cleanly", () => {
    cy.visit("/");
    cy.findAllByRole("checkbox").eq(randomInteger(0, 9)).check();
    cy.findAllByRole("checkbox").eq(randomInteger(0, 9)).check();
    cy.findByRole("button", { name: "Compare" }).click();
    cy.findByRole("button", { name: "Close Modal" }).click();
  });
});

export {};
