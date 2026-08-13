// Generated from dander-platform==0.9.0rc18; do not edit.
// Contract bundle io.dander.control.contracts/v1 (344ef5ff2d685d5bedf7a1ddb119a42a6de08d90f285dc0a981e79c55452c1ed).
"use strict";
export const validateApiError = validate20;
const schema31 = {
  $defs: {
    ApiError: {
      additionalProperties: false,
      properties: {
        code: { title: "Code", type: "string" },
        correlation_id: { title: "Correlation Id", type: "string" },
        details: { items: { $ref: "#/$defs/ApiErrorDetail" }, title: "Details", type: "array" },
        message: { title: "Message", type: "string" },
      },
      required: ["code", "message", "correlation_id"],
      title: "ApiError",
      type: "object",
    },
    ApiErrorDetail: {
      additionalProperties: false,
      properties: {
        code: { title: "Code", type: "string" },
        location: {
          anyOf: [{ type: "string" }, { type: "null" }],
          default: null,
          title: "Location",
        },
        message: { title: "Message", type: "string" },
      },
      required: ["code", "message"],
      title: "ApiErrorDetail",
      type: "object",
    },
  },
  $id: "urn:dander:control:contracts:v1:api-error",
  $schema: "https://json-schema.org/draft/2020-12/schema",
  additionalProperties: false,
  properties: { error: { $ref: "#/$defs/ApiError" } },
  required: ["error"],
  title: "ApiErrorEnvelope",
  type: "object",
};
const schema32 = {
  additionalProperties: false,
  properties: {
    code: { title: "Code", type: "string" },
    correlation_id: { title: "Correlation Id", type: "string" },
    details: { items: { $ref: "#/$defs/ApiErrorDetail" }, title: "Details", type: "array" },
    message: { title: "Message", type: "string" },
  },
  required: ["code", "message", "correlation_id"],
  title: "ApiError",
  type: "object",
};
const schema33 = {
  additionalProperties: false,
  properties: {
    code: { title: "Code", type: "string" },
    location: { anyOf: [{ type: "string" }, { type: "null" }], default: null, title: "Location" },
    message: { title: "Message", type: "string" },
  },
  required: ["code", "message"],
  title: "ApiErrorDetail",
  type: "object",
};

function validate21(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate21.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.code === undefined) {
      const err0 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "code" },
        message: "must have required property '" + "code" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.message === undefined) {
      const err1 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "message" },
        message: "must have required property '" + "message" + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.correlation_id === undefined) {
      const err2 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "correlation_id" },
        message: "must have required property '" + "correlation_id" + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(
        key0 === "code" ||
        key0 === "correlation_id" ||
        key0 === "details" ||
        key0 === "message"
      )) {
        const err3 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.code !== undefined) {
      if (typeof data.code !== "string") {
        const err4 = {
          instancePath: instancePath + "/code",
          schemaPath: "#/properties/code/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.correlation_id !== undefined) {
      if (typeof data.correlation_id !== "string") {
        const err5 = {
          instancePath: instancePath + "/correlation_id",
          schemaPath: "#/properties/correlation_id/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.details !== undefined) {
      let data2 = data.details;
      if (Array.isArray(data2)) {
        const len0 = data2.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data3 = data2[i0];
          if (data3 && typeof data3 == "object" && !Array.isArray(data3)) {
            if (data3.code === undefined) {
              const err6 = {
                instancePath: instancePath + "/details/" + i0,
                schemaPath: "#/$defs/ApiErrorDetail/required",
                keyword: "required",
                params: { missingProperty: "code" },
                message: "must have required property '" + "code" + "'",
              };
              if (vErrors === null) {
                vErrors = [err6];
              } else {
                vErrors.push(err6);
              }
              errors++;
            }
            if (data3.message === undefined) {
              const err7 = {
                instancePath: instancePath + "/details/" + i0,
                schemaPath: "#/$defs/ApiErrorDetail/required",
                keyword: "required",
                params: { missingProperty: "message" },
                message: "must have required property '" + "message" + "'",
              };
              if (vErrors === null) {
                vErrors = [err7];
              } else {
                vErrors.push(err7);
              }
              errors++;
            }
            for (const key1 in data3) {
              if (!(key1 === "code" || key1 === "location" || key1 === "message")) {
                const err8 = {
                  instancePath: instancePath + "/details/" + i0,
                  schemaPath: "#/$defs/ApiErrorDetail/additionalProperties",
                  keyword: "additionalProperties",
                  params: { additionalProperty: key1 },
                  message: "must NOT have additional properties",
                };
                if (vErrors === null) {
                  vErrors = [err8];
                } else {
                  vErrors.push(err8);
                }
                errors++;
              }
            }
            if (data3.code !== undefined) {
              if (typeof data3.code !== "string") {
                const err9 = {
                  instancePath: instancePath + "/details/" + i0 + "/code",
                  schemaPath: "#/$defs/ApiErrorDetail/properties/code/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string",
                };
                if (vErrors === null) {
                  vErrors = [err9];
                } else {
                  vErrors.push(err9);
                }
                errors++;
              }
            }
            if (data3.location !== undefined) {
              let data5 = data3.location;
              const _errs15 = errors;
              let valid5 = false;
              const _errs16 = errors;
              if (typeof data5 !== "string") {
                const err10 = {
                  instancePath: instancePath + "/details/" + i0 + "/location",
                  schemaPath: "#/$defs/ApiErrorDetail/properties/location/anyOf/0/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string",
                };
                if (vErrors === null) {
                  vErrors = [err10];
                } else {
                  vErrors.push(err10);
                }
                errors++;
              }
              var _valid0 = _errs16 === errors;
              valid5 = valid5 || _valid0;
              const _errs18 = errors;
              if (data5 !== null) {
                const err11 = {
                  instancePath: instancePath + "/details/" + i0 + "/location",
                  schemaPath: "#/$defs/ApiErrorDetail/properties/location/anyOf/1/type",
                  keyword: "type",
                  params: { type: "null" },
                  message: "must be null",
                };
                if (vErrors === null) {
                  vErrors = [err11];
                } else {
                  vErrors.push(err11);
                }
                errors++;
              }
              var _valid0 = _errs18 === errors;
              valid5 = valid5 || _valid0;
              if (!valid5) {
                const err12 = {
                  instancePath: instancePath + "/details/" + i0 + "/location",
                  schemaPath: "#/$defs/ApiErrorDetail/properties/location/anyOf",
                  keyword: "anyOf",
                  params: {},
                  message: "must match a schema in anyOf",
                };
                if (vErrors === null) {
                  vErrors = [err12];
                } else {
                  vErrors.push(err12);
                }
                errors++;
              } else {
                errors = _errs15;
                if (vErrors !== null) {
                  if (_errs15) {
                    vErrors.length = _errs15;
                  } else {
                    vErrors = null;
                  }
                }
              }
            }
            if (data3.message !== undefined) {
              if (typeof data3.message !== "string") {
                const err13 = {
                  instancePath: instancePath + "/details/" + i0 + "/message",
                  schemaPath: "#/$defs/ApiErrorDetail/properties/message/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string",
                };
                if (vErrors === null) {
                  vErrors = [err13];
                } else {
                  vErrors.push(err13);
                }
                errors++;
              }
            }
          } else {
            const err14 = {
              instancePath: instancePath + "/details/" + i0,
              schemaPath: "#/$defs/ApiErrorDetail/type",
              keyword: "type",
              params: { type: "object" },
              message: "must be object",
            };
            if (vErrors === null) {
              vErrors = [err14];
            } else {
              vErrors.push(err14);
            }
            errors++;
          }
        }
      } else {
        const err15 = {
          instancePath: instancePath + "/details",
          schemaPath: "#/properties/details/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array",
        };
        if (vErrors === null) {
          vErrors = [err15];
        } else {
          vErrors.push(err15);
        }
        errors++;
      }
    }
    if (data.message !== undefined) {
      if (typeof data.message !== "string") {
        const err16 = {
          instancePath: instancePath + "/message",
          schemaPath: "#/properties/message/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err16];
        } else {
          vErrors.push(err16);
        }
        errors++;
      }
    }
  } else {
    const err17 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err17];
    } else {
      vErrors.push(err17);
    }
    errors++;
  }
  validate21.errors = vErrors;
  return errors === 0;
}
validate21.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

function validate20(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="urn:dander:control:contracts:v1:api-error" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate20.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.error === undefined) {
      const err0 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "error" },
        message: "must have required property '" + "error" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(key0 === "error")) {
        const err1 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
    if (data.error !== undefined) {
      if (
        !validate21(data.error, {
          instancePath: instancePath + "/error",
          parentData: data,
          parentDataProperty: "error",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate21.errors : vErrors.concat(validate21.errors);
        errors = vErrors.length;
      }
    }
  } else {
    const err2 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err2];
    } else {
      vErrors.push(err2);
    }
    errors++;
  }
  validate20.errors = vErrors;
  return errors === 0;
}
validate20.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

export const validateCapabilities = validate23;
const schema34 = {
  $defs: {
    CompatibilityRange: {
      additionalProperties: false,
      properties: {
        maximum_druff_contract: { title: "Maximum Druff Contract", type: "string" },
        minimum_druff_contract: { title: "Minimum Druff Contract", type: "string" },
      },
      required: ["minimum_druff_contract", "maximum_druff_contract"],
      title: "CompatibilityRange",
      type: "object",
    },
    ContractIdentity: {
      additionalProperties: false,
      properties: {
        id: { const: "io.dander.control.contracts/v1", title: "Id", type: "string" },
        sha256: { pattern: "^[0-9a-f]{64}$", title: "Sha256", type: "string" },
      },
      required: ["id", "sha256"],
      title: "ContractIdentity",
      type: "object",
    },
    ControlLimits: {
      additionalProperties: false,
      properties: {
        max_graph_bytes: { exclusiveMinimum: 0, title: "Max Graph Bytes", type: "integer" },
        max_log_records: { exclusiveMinimum: 0, title: "Max Log Records", type: "integer" },
        max_page_size: { exclusiveMinimum: 0, title: "Max Page Size", type: "integer" },
      },
      required: ["max_graph_bytes", "max_page_size", "max_log_records"],
      title: "ControlLimits",
      type: "object",
    },
  },
  $id: "urn:dander:control:contracts:v1:capabilities",
  $schema: "https://json-schema.org/draft/2020-12/schema",
  additionalProperties: false,
  properties: {
    api_version: { const: "v1", default: "v1", title: "Api Version", type: "string" },
    compatibility: { $ref: "#/$defs/CompatibilityRange" },
    contract: { $ref: "#/$defs/ContractIdentity" },
    dander_version: { title: "Dander Version", type: "string" },
    limits: { $ref: "#/$defs/ControlLimits" },
    operations: {
      items: {
        enum: [
          "graph.read",
          "graph.edit",
          "graph.delete",
          "graph.validate",
          "deployment.preview",
          "run.start",
          "run.read",
          "run.logs",
          "run.cancel",
          "run.replay",
        ],
        type: "string",
      },
      title: "Operations",
      type: "array",
    },
  },
  required: ["dander_version", "contract", "compatibility", "operations", "limits"],
  title: "CapabilitiesResponse",
  type: "object",
};
const schema35 = {
  additionalProperties: false,
  properties: {
    maximum_druff_contract: { title: "Maximum Druff Contract", type: "string" },
    minimum_druff_contract: { title: "Minimum Druff Contract", type: "string" },
  },
  required: ["minimum_druff_contract", "maximum_druff_contract"],
  title: "CompatibilityRange",
  type: "object",
};
const schema36 = {
  additionalProperties: false,
  properties: {
    id: { const: "io.dander.control.contracts/v1", title: "Id", type: "string" },
    sha256: { pattern: "^[0-9a-f]{64}$", title: "Sha256", type: "string" },
  },
  required: ["id", "sha256"],
  title: "ContractIdentity",
  type: "object",
};
const schema37 = {
  additionalProperties: false,
  properties: {
    max_graph_bytes: { exclusiveMinimum: 0, title: "Max Graph Bytes", type: "integer" },
    max_log_records: { exclusiveMinimum: 0, title: "Max Log Records", type: "integer" },
    max_page_size: { exclusiveMinimum: 0, title: "Max Page Size", type: "integer" },
  },
  required: ["max_graph_bytes", "max_page_size", "max_log_records"],
  title: "ControlLimits",
  type: "object",
};
const pattern4 = new RegExp("^[0-9a-f]{64}$", "u");

function validate23(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="urn:dander:control:contracts:v1:capabilities" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate23.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.dander_version === undefined) {
      const err0 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "dander_version" },
        message: "must have required property '" + "dander_version" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.contract === undefined) {
      const err1 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "contract" },
        message: "must have required property '" + "contract" + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.compatibility === undefined) {
      const err2 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "compatibility" },
        message: "must have required property '" + "compatibility" + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.operations === undefined) {
      const err3 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "operations" },
        message: "must have required property '" + "operations" + "'",
      };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    if (data.limits === undefined) {
      const err4 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "limits" },
        message: "must have required property '" + "limits" + "'",
      };
      if (vErrors === null) {
        vErrors = [err4];
      } else {
        vErrors.push(err4);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(
        key0 === "api_version" ||
        key0 === "compatibility" ||
        key0 === "contract" ||
        key0 === "dander_version" ||
        key0 === "limits" ||
        key0 === "operations"
      )) {
        const err5 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.api_version !== undefined) {
      let data0 = data.api_version;
      if (typeof data0 !== "string") {
        const err6 = {
          instancePath: instancePath + "/api_version",
          schemaPath: "#/properties/api_version/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
      if ("v1" !== data0) {
        const err7 = {
          instancePath: instancePath + "/api_version",
          schemaPath: "#/properties/api_version/const",
          keyword: "const",
          params: { allowedValue: "v1" },
          message: "must be equal to constant",
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
    if (data.compatibility !== undefined) {
      let data1 = data.compatibility;
      if (data1 && typeof data1 == "object" && !Array.isArray(data1)) {
        if (data1.minimum_druff_contract === undefined) {
          const err8 = {
            instancePath: instancePath + "/compatibility",
            schemaPath: "#/$defs/CompatibilityRange/required",
            keyword: "required",
            params: { missingProperty: "minimum_druff_contract" },
            message: "must have required property '" + "minimum_druff_contract" + "'",
          };
          if (vErrors === null) {
            vErrors = [err8];
          } else {
            vErrors.push(err8);
          }
          errors++;
        }
        if (data1.maximum_druff_contract === undefined) {
          const err9 = {
            instancePath: instancePath + "/compatibility",
            schemaPath: "#/$defs/CompatibilityRange/required",
            keyword: "required",
            params: { missingProperty: "maximum_druff_contract" },
            message: "must have required property '" + "maximum_druff_contract" + "'",
          };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
        for (const key1 in data1) {
          if (!(key1 === "maximum_druff_contract" || key1 === "minimum_druff_contract")) {
            const err10 = {
              instancePath: instancePath + "/compatibility",
              schemaPath: "#/$defs/CompatibilityRange/additionalProperties",
              keyword: "additionalProperties",
              params: { additionalProperty: key1 },
              message: "must NOT have additional properties",
            };
            if (vErrors === null) {
              vErrors = [err10];
            } else {
              vErrors.push(err10);
            }
            errors++;
          }
        }
        if (data1.maximum_druff_contract !== undefined) {
          if (typeof data1.maximum_druff_contract !== "string") {
            const err11 = {
              instancePath: instancePath + "/compatibility/maximum_druff_contract",
              schemaPath: "#/$defs/CompatibilityRange/properties/maximum_druff_contract/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string",
            };
            if (vErrors === null) {
              vErrors = [err11];
            } else {
              vErrors.push(err11);
            }
            errors++;
          }
        }
        if (data1.minimum_druff_contract !== undefined) {
          if (typeof data1.minimum_druff_contract !== "string") {
            const err12 = {
              instancePath: instancePath + "/compatibility/minimum_druff_contract",
              schemaPath: "#/$defs/CompatibilityRange/properties/minimum_druff_contract/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string",
            };
            if (vErrors === null) {
              vErrors = [err12];
            } else {
              vErrors.push(err12);
            }
            errors++;
          }
        }
      } else {
        const err13 = {
          instancePath: instancePath + "/compatibility",
          schemaPath: "#/$defs/CompatibilityRange/type",
          keyword: "type",
          params: { type: "object" },
          message: "must be object",
        };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
    }
    if (data.contract !== undefined) {
      let data4 = data.contract;
      if (data4 && typeof data4 == "object" && !Array.isArray(data4)) {
        if (data4.id === undefined) {
          const err14 = {
            instancePath: instancePath + "/contract",
            schemaPath: "#/$defs/ContractIdentity/required",
            keyword: "required",
            params: { missingProperty: "id" },
            message: "must have required property '" + "id" + "'",
          };
          if (vErrors === null) {
            vErrors = [err14];
          } else {
            vErrors.push(err14);
          }
          errors++;
        }
        if (data4.sha256 === undefined) {
          const err15 = {
            instancePath: instancePath + "/contract",
            schemaPath: "#/$defs/ContractIdentity/required",
            keyword: "required",
            params: { missingProperty: "sha256" },
            message: "must have required property '" + "sha256" + "'",
          };
          if (vErrors === null) {
            vErrors = [err15];
          } else {
            vErrors.push(err15);
          }
          errors++;
        }
        for (const key2 in data4) {
          if (!(key2 === "id" || key2 === "sha256")) {
            const err16 = {
              instancePath: instancePath + "/contract",
              schemaPath: "#/$defs/ContractIdentity/additionalProperties",
              keyword: "additionalProperties",
              params: { additionalProperty: key2 },
              message: "must NOT have additional properties",
            };
            if (vErrors === null) {
              vErrors = [err16];
            } else {
              vErrors.push(err16);
            }
            errors++;
          }
        }
        if (data4.id !== undefined) {
          let data5 = data4.id;
          if (typeof data5 !== "string") {
            const err17 = {
              instancePath: instancePath + "/contract/id",
              schemaPath: "#/$defs/ContractIdentity/properties/id/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string",
            };
            if (vErrors === null) {
              vErrors = [err17];
            } else {
              vErrors.push(err17);
            }
            errors++;
          }
          if ("io.dander.control.contracts/v1" !== data5) {
            const err18 = {
              instancePath: instancePath + "/contract/id",
              schemaPath: "#/$defs/ContractIdentity/properties/id/const",
              keyword: "const",
              params: { allowedValue: "io.dander.control.contracts/v1" },
              message: "must be equal to constant",
            };
            if (vErrors === null) {
              vErrors = [err18];
            } else {
              vErrors.push(err18);
            }
            errors++;
          }
        }
        if (data4.sha256 !== undefined) {
          let data6 = data4.sha256;
          if (typeof data6 === "string") {
            if (!pattern4.test(data6)) {
              const err19 = {
                instancePath: instancePath + "/contract/sha256",
                schemaPath: "#/$defs/ContractIdentity/properties/sha256/pattern",
                keyword: "pattern",
                params: { pattern: "^[0-9a-f]{64}$" },
                message: 'must match pattern "' + "^[0-9a-f]{64}$" + '"',
              };
              if (vErrors === null) {
                vErrors = [err19];
              } else {
                vErrors.push(err19);
              }
              errors++;
            }
          } else {
            const err20 = {
              instancePath: instancePath + "/contract/sha256",
              schemaPath: "#/$defs/ContractIdentity/properties/sha256/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string",
            };
            if (vErrors === null) {
              vErrors = [err20];
            } else {
              vErrors.push(err20);
            }
            errors++;
          }
        }
      } else {
        const err21 = {
          instancePath: instancePath + "/contract",
          schemaPath: "#/$defs/ContractIdentity/type",
          keyword: "type",
          params: { type: "object" },
          message: "must be object",
        };
        if (vErrors === null) {
          vErrors = [err21];
        } else {
          vErrors.push(err21);
        }
        errors++;
      }
    }
    if (data.dander_version !== undefined) {
      if (typeof data.dander_version !== "string") {
        const err22 = {
          instancePath: instancePath + "/dander_version",
          schemaPath: "#/properties/dander_version/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
    }
    if (data.limits !== undefined) {
      let data8 = data.limits;
      if (data8 && typeof data8 == "object" && !Array.isArray(data8)) {
        if (data8.max_graph_bytes === undefined) {
          const err23 = {
            instancePath: instancePath + "/limits",
            schemaPath: "#/$defs/ControlLimits/required",
            keyword: "required",
            params: { missingProperty: "max_graph_bytes" },
            message: "must have required property '" + "max_graph_bytes" + "'",
          };
          if (vErrors === null) {
            vErrors = [err23];
          } else {
            vErrors.push(err23);
          }
          errors++;
        }
        if (data8.max_page_size === undefined) {
          const err24 = {
            instancePath: instancePath + "/limits",
            schemaPath: "#/$defs/ControlLimits/required",
            keyword: "required",
            params: { missingProperty: "max_page_size" },
            message: "must have required property '" + "max_page_size" + "'",
          };
          if (vErrors === null) {
            vErrors = [err24];
          } else {
            vErrors.push(err24);
          }
          errors++;
        }
        if (data8.max_log_records === undefined) {
          const err25 = {
            instancePath: instancePath + "/limits",
            schemaPath: "#/$defs/ControlLimits/required",
            keyword: "required",
            params: { missingProperty: "max_log_records" },
            message: "must have required property '" + "max_log_records" + "'",
          };
          if (vErrors === null) {
            vErrors = [err25];
          } else {
            vErrors.push(err25);
          }
          errors++;
        }
        for (const key3 in data8) {
          if (!(
            key3 === "max_graph_bytes" ||
            key3 === "max_log_records" ||
            key3 === "max_page_size"
          )) {
            const err26 = {
              instancePath: instancePath + "/limits",
              schemaPath: "#/$defs/ControlLimits/additionalProperties",
              keyword: "additionalProperties",
              params: { additionalProperty: key3 },
              message: "must NOT have additional properties",
            };
            if (vErrors === null) {
              vErrors = [err26];
            } else {
              vErrors.push(err26);
            }
            errors++;
          }
        }
        if (data8.max_graph_bytes !== undefined) {
          let data9 = data8.max_graph_bytes;
          if (!(typeof data9 == "number" && !(data9 % 1) && !isNaN(data9) && isFinite(data9))) {
            const err27 = {
              instancePath: instancePath + "/limits/max_graph_bytes",
              schemaPath: "#/$defs/ControlLimits/properties/max_graph_bytes/type",
              keyword: "type",
              params: { type: "integer" },
              message: "must be integer",
            };
            if (vErrors === null) {
              vErrors = [err27];
            } else {
              vErrors.push(err27);
            }
            errors++;
          }
          if (typeof data9 == "number" && isFinite(data9)) {
            if (data9 <= 0 || isNaN(data9)) {
              const err28 = {
                instancePath: instancePath + "/limits/max_graph_bytes",
                schemaPath: "#/$defs/ControlLimits/properties/max_graph_bytes/exclusiveMinimum",
                keyword: "exclusiveMinimum",
                params: { comparison: ">", limit: 0 },
                message: "must be > 0",
              };
              if (vErrors === null) {
                vErrors = [err28];
              } else {
                vErrors.push(err28);
              }
              errors++;
            }
          }
        }
        if (data8.max_log_records !== undefined) {
          let data10 = data8.max_log_records;
          if (!(typeof data10 == "number" && !(data10 % 1) && !isNaN(data10) && isFinite(data10))) {
            const err29 = {
              instancePath: instancePath + "/limits/max_log_records",
              schemaPath: "#/$defs/ControlLimits/properties/max_log_records/type",
              keyword: "type",
              params: { type: "integer" },
              message: "must be integer",
            };
            if (vErrors === null) {
              vErrors = [err29];
            } else {
              vErrors.push(err29);
            }
            errors++;
          }
          if (typeof data10 == "number" && isFinite(data10)) {
            if (data10 <= 0 || isNaN(data10)) {
              const err30 = {
                instancePath: instancePath + "/limits/max_log_records",
                schemaPath: "#/$defs/ControlLimits/properties/max_log_records/exclusiveMinimum",
                keyword: "exclusiveMinimum",
                params: { comparison: ">", limit: 0 },
                message: "must be > 0",
              };
              if (vErrors === null) {
                vErrors = [err30];
              } else {
                vErrors.push(err30);
              }
              errors++;
            }
          }
        }
        if (data8.max_page_size !== undefined) {
          let data11 = data8.max_page_size;
          if (!(typeof data11 == "number" && !(data11 % 1) && !isNaN(data11) && isFinite(data11))) {
            const err31 = {
              instancePath: instancePath + "/limits/max_page_size",
              schemaPath: "#/$defs/ControlLimits/properties/max_page_size/type",
              keyword: "type",
              params: { type: "integer" },
              message: "must be integer",
            };
            if (vErrors === null) {
              vErrors = [err31];
            } else {
              vErrors.push(err31);
            }
            errors++;
          }
          if (typeof data11 == "number" && isFinite(data11)) {
            if (data11 <= 0 || isNaN(data11)) {
              const err32 = {
                instancePath: instancePath + "/limits/max_page_size",
                schemaPath: "#/$defs/ControlLimits/properties/max_page_size/exclusiveMinimum",
                keyword: "exclusiveMinimum",
                params: { comparison: ">", limit: 0 },
                message: "must be > 0",
              };
              if (vErrors === null) {
                vErrors = [err32];
              } else {
                vErrors.push(err32);
              }
              errors++;
            }
          }
        }
      } else {
        const err33 = {
          instancePath: instancePath + "/limits",
          schemaPath: "#/$defs/ControlLimits/type",
          keyword: "type",
          params: { type: "object" },
          message: "must be object",
        };
        if (vErrors === null) {
          vErrors = [err33];
        } else {
          vErrors.push(err33);
        }
        errors++;
      }
    }
    if (data.operations !== undefined) {
      let data12 = data.operations;
      if (Array.isArray(data12)) {
        const len0 = data12.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data13 = data12[i0];
          if (typeof data13 !== "string") {
            const err34 = {
              instancePath: instancePath + "/operations/" + i0,
              schemaPath: "#/properties/operations/items/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string",
            };
            if (vErrors === null) {
              vErrors = [err34];
            } else {
              vErrors.push(err34);
            }
            errors++;
          }
          if (!(
            data13 === "graph.read" ||
            data13 === "graph.edit" ||
            data13 === "graph.delete" ||
            data13 === "graph.validate" ||
            data13 === "deployment.preview" ||
            data13 === "run.start" ||
            data13 === "run.read" ||
            data13 === "run.logs" ||
            data13 === "run.cancel" ||
            data13 === "run.replay"
          )) {
            const err35 = {
              instancePath: instancePath + "/operations/" + i0,
              schemaPath: "#/properties/operations/items/enum",
              keyword: "enum",
              params: { allowedValues: schema34.properties.operations.items.enum },
              message: "must be equal to one of the allowed values",
            };
            if (vErrors === null) {
              vErrors = [err35];
            } else {
              vErrors.push(err35);
            }
            errors++;
          }
        }
      } else {
        const err36 = {
          instancePath: instancePath + "/operations",
          schemaPath: "#/properties/operations/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array",
        };
        if (vErrors === null) {
          vErrors = [err36];
        } else {
          vErrors.push(err36);
        }
        errors++;
      }
    }
  } else {
    const err37 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err37];
    } else {
      vErrors.push(err37);
    }
    errors++;
  }
  validate23.errors = vErrors;
  return errors === 0;
}
validate23.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

export const validateConnectorCatalog = validate24;
const schema38 = {
  $defs: {
    ConnectorBinding: {
      additionalProperties: false,
      properties: {
        connector: { title: "Connector", type: "string" },
        endpoint: { title: "Endpoint", type: "string" },
      },
      required: ["connector", "endpoint"],
      title: "ConnectorBinding",
      type: "object",
    },
    ConnectorEndpoint: {
      additionalProperties: false,
      properties: {
        display_name: { title: "Display Name", type: "string" },
        fields: { items: { $ref: "#/$defs/ConnectorField" }, title: "Fields", type: "array" },
        graph_binding: { $ref: "#/$defs/ConnectorBinding" },
        id: { title: "Id", type: "string" },
      },
      required: ["id", "display_name", "graph_binding"],
      title: "ConnectorEndpoint",
      type: "object",
    },
    ConnectorField: {
      additionalProperties: false,
      properties: {
        data_type: { title: "Data Type", type: "string" },
        display_name: { title: "Display Name", type: "string" },
        name: { title: "Name", type: "string" },
        required: { default: false, title: "Required", type: "boolean" },
      },
      required: ["name", "display_name", "data_type"],
      title: "ConnectorField",
      type: "object",
    },
    InstalledConnector: {
      additionalProperties: false,
      properties: {
        description: { default: "", title: "Description", type: "string" },
        display_name: { title: "Display Name", type: "string" },
        endpoints: {
          items: { $ref: "#/$defs/ConnectorEndpoint" },
          title: "Endpoints",
          type: "array",
        },
        engine: { title: "Engine", type: "string" },
        id: { title: "Id", type: "string" },
        plugin: { $ref: "#/$defs/InstalledPluginIdentity" },
      },
      required: ["id", "display_name", "engine", "plugin"],
      title: "InstalledConnector",
      type: "object",
    },
    InstalledPluginIdentity: {
      additionalProperties: false,
      properties: {
        distribution: { title: "Distribution", type: "string" },
        id: { title: "Id", type: "string" },
        version: { title: "Version", type: "string" },
      },
      required: ["id", "distribution", "version"],
      title: "InstalledPluginIdentity",
      type: "object",
    },
  },
  $id: "urn:dander:control:contracts:v1:connector-catalog",
  $schema: "https://json-schema.org/draft/2020-12/schema",
  additionalProperties: false,
  properties: {
    connectors: {
      items: { $ref: "#/$defs/InstalledConnector" },
      title: "Connectors",
      type: "array",
    },
  },
  title: "ConnectorCatalogResponse",
  type: "object",
};
const schema39 = {
  additionalProperties: false,
  properties: {
    description: { default: "", title: "Description", type: "string" },
    display_name: { title: "Display Name", type: "string" },
    endpoints: { items: { $ref: "#/$defs/ConnectorEndpoint" }, title: "Endpoints", type: "array" },
    engine: { title: "Engine", type: "string" },
    id: { title: "Id", type: "string" },
    plugin: { $ref: "#/$defs/InstalledPluginIdentity" },
  },
  required: ["id", "display_name", "engine", "plugin"],
  title: "InstalledConnector",
  type: "object",
};
const schema43 = {
  additionalProperties: false,
  properties: {
    distribution: { title: "Distribution", type: "string" },
    id: { title: "Id", type: "string" },
    version: { title: "Version", type: "string" },
  },
  required: ["id", "distribution", "version"],
  title: "InstalledPluginIdentity",
  type: "object",
};
const schema40 = {
  additionalProperties: false,
  properties: {
    display_name: { title: "Display Name", type: "string" },
    fields: { items: { $ref: "#/$defs/ConnectorField" }, title: "Fields", type: "array" },
    graph_binding: { $ref: "#/$defs/ConnectorBinding" },
    id: { title: "Id", type: "string" },
  },
  required: ["id", "display_name", "graph_binding"],
  title: "ConnectorEndpoint",
  type: "object",
};
const schema41 = {
  additionalProperties: false,
  properties: {
    data_type: { title: "Data Type", type: "string" },
    display_name: { title: "Display Name", type: "string" },
    name: { title: "Name", type: "string" },
    required: { default: false, title: "Required", type: "boolean" },
  },
  required: ["name", "display_name", "data_type"],
  title: "ConnectorField",
  type: "object",
};
const schema42 = {
  additionalProperties: false,
  properties: {
    connector: { title: "Connector", type: "string" },
    endpoint: { title: "Endpoint", type: "string" },
  },
  required: ["connector", "endpoint"],
  title: "ConnectorBinding",
  type: "object",
};

function validate26(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate26.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.id === undefined) {
      const err0 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "id" },
        message: "must have required property '" + "id" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.display_name === undefined) {
      const err1 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "display_name" },
        message: "must have required property '" + "display_name" + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.graph_binding === undefined) {
      const err2 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "graph_binding" },
        message: "must have required property '" + "graph_binding" + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(
        key0 === "display_name" ||
        key0 === "fields" ||
        key0 === "graph_binding" ||
        key0 === "id"
      )) {
        const err3 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.display_name !== undefined) {
      if (typeof data.display_name !== "string") {
        const err4 = {
          instancePath: instancePath + "/display_name",
          schemaPath: "#/properties/display_name/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.fields !== undefined) {
      let data1 = data.fields;
      if (Array.isArray(data1)) {
        const len0 = data1.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data2 = data1[i0];
          if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
            if (data2.name === undefined) {
              const err5 = {
                instancePath: instancePath + "/fields/" + i0,
                schemaPath: "#/$defs/ConnectorField/required",
                keyword: "required",
                params: { missingProperty: "name" },
                message: "must have required property '" + "name" + "'",
              };
              if (vErrors === null) {
                vErrors = [err5];
              } else {
                vErrors.push(err5);
              }
              errors++;
            }
            if (data2.display_name === undefined) {
              const err6 = {
                instancePath: instancePath + "/fields/" + i0,
                schemaPath: "#/$defs/ConnectorField/required",
                keyword: "required",
                params: { missingProperty: "display_name" },
                message: "must have required property '" + "display_name" + "'",
              };
              if (vErrors === null) {
                vErrors = [err6];
              } else {
                vErrors.push(err6);
              }
              errors++;
            }
            if (data2.data_type === undefined) {
              const err7 = {
                instancePath: instancePath + "/fields/" + i0,
                schemaPath: "#/$defs/ConnectorField/required",
                keyword: "required",
                params: { missingProperty: "data_type" },
                message: "must have required property '" + "data_type" + "'",
              };
              if (vErrors === null) {
                vErrors = [err7];
              } else {
                vErrors.push(err7);
              }
              errors++;
            }
            for (const key1 in data2) {
              if (!(
                key1 === "data_type" ||
                key1 === "display_name" ||
                key1 === "name" ||
                key1 === "required"
              )) {
                const err8 = {
                  instancePath: instancePath + "/fields/" + i0,
                  schemaPath: "#/$defs/ConnectorField/additionalProperties",
                  keyword: "additionalProperties",
                  params: { additionalProperty: key1 },
                  message: "must NOT have additional properties",
                };
                if (vErrors === null) {
                  vErrors = [err8];
                } else {
                  vErrors.push(err8);
                }
                errors++;
              }
            }
            if (data2.data_type !== undefined) {
              if (typeof data2.data_type !== "string") {
                const err9 = {
                  instancePath: instancePath + "/fields/" + i0 + "/data_type",
                  schemaPath: "#/$defs/ConnectorField/properties/data_type/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string",
                };
                if (vErrors === null) {
                  vErrors = [err9];
                } else {
                  vErrors.push(err9);
                }
                errors++;
              }
            }
            if (data2.display_name !== undefined) {
              if (typeof data2.display_name !== "string") {
                const err10 = {
                  instancePath: instancePath + "/fields/" + i0 + "/display_name",
                  schemaPath: "#/$defs/ConnectorField/properties/display_name/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string",
                };
                if (vErrors === null) {
                  vErrors = [err10];
                } else {
                  vErrors.push(err10);
                }
                errors++;
              }
            }
            if (data2.name !== undefined) {
              if (typeof data2.name !== "string") {
                const err11 = {
                  instancePath: instancePath + "/fields/" + i0 + "/name",
                  schemaPath: "#/$defs/ConnectorField/properties/name/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string",
                };
                if (vErrors === null) {
                  vErrors = [err11];
                } else {
                  vErrors.push(err11);
                }
                errors++;
              }
            }
            if (data2.required !== undefined) {
              if (typeof data2.required !== "boolean") {
                const err12 = {
                  instancePath: instancePath + "/fields/" + i0 + "/required",
                  schemaPath: "#/$defs/ConnectorField/properties/required/type",
                  keyword: "type",
                  params: { type: "boolean" },
                  message: "must be boolean",
                };
                if (vErrors === null) {
                  vErrors = [err12];
                } else {
                  vErrors.push(err12);
                }
                errors++;
              }
            }
          } else {
            const err13 = {
              instancePath: instancePath + "/fields/" + i0,
              schemaPath: "#/$defs/ConnectorField/type",
              keyword: "type",
              params: { type: "object" },
              message: "must be object",
            };
            if (vErrors === null) {
              vErrors = [err13];
            } else {
              vErrors.push(err13);
            }
            errors++;
          }
        }
      } else {
        const err14 = {
          instancePath: instancePath + "/fields",
          schemaPath: "#/properties/fields/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array",
        };
        if (vErrors === null) {
          vErrors = [err14];
        } else {
          vErrors.push(err14);
        }
        errors++;
      }
    }
    if (data.graph_binding !== undefined) {
      let data7 = data.graph_binding;
      if (data7 && typeof data7 == "object" && !Array.isArray(data7)) {
        if (data7.connector === undefined) {
          const err15 = {
            instancePath: instancePath + "/graph_binding",
            schemaPath: "#/$defs/ConnectorBinding/required",
            keyword: "required",
            params: { missingProperty: "connector" },
            message: "must have required property '" + "connector" + "'",
          };
          if (vErrors === null) {
            vErrors = [err15];
          } else {
            vErrors.push(err15);
          }
          errors++;
        }
        if (data7.endpoint === undefined) {
          const err16 = {
            instancePath: instancePath + "/graph_binding",
            schemaPath: "#/$defs/ConnectorBinding/required",
            keyword: "required",
            params: { missingProperty: "endpoint" },
            message: "must have required property '" + "endpoint" + "'",
          };
          if (vErrors === null) {
            vErrors = [err16];
          } else {
            vErrors.push(err16);
          }
          errors++;
        }
        for (const key2 in data7) {
          if (!(key2 === "connector" || key2 === "endpoint")) {
            const err17 = {
              instancePath: instancePath + "/graph_binding",
              schemaPath: "#/$defs/ConnectorBinding/additionalProperties",
              keyword: "additionalProperties",
              params: { additionalProperty: key2 },
              message: "must NOT have additional properties",
            };
            if (vErrors === null) {
              vErrors = [err17];
            } else {
              vErrors.push(err17);
            }
            errors++;
          }
        }
        if (data7.connector !== undefined) {
          if (typeof data7.connector !== "string") {
            const err18 = {
              instancePath: instancePath + "/graph_binding/connector",
              schemaPath: "#/$defs/ConnectorBinding/properties/connector/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string",
            };
            if (vErrors === null) {
              vErrors = [err18];
            } else {
              vErrors.push(err18);
            }
            errors++;
          }
        }
        if (data7.endpoint !== undefined) {
          if (typeof data7.endpoint !== "string") {
            const err19 = {
              instancePath: instancePath + "/graph_binding/endpoint",
              schemaPath: "#/$defs/ConnectorBinding/properties/endpoint/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string",
            };
            if (vErrors === null) {
              vErrors = [err19];
            } else {
              vErrors.push(err19);
            }
            errors++;
          }
        }
      } else {
        const err20 = {
          instancePath: instancePath + "/graph_binding",
          schemaPath: "#/$defs/ConnectorBinding/type",
          keyword: "type",
          params: { type: "object" },
          message: "must be object",
        };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
    if (data.id !== undefined) {
      if (typeof data.id !== "string") {
        const err21 = {
          instancePath: instancePath + "/id",
          schemaPath: "#/properties/id/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err21];
        } else {
          vErrors.push(err21);
        }
        errors++;
      }
    }
  } else {
    const err22 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err22];
    } else {
      vErrors.push(err22);
    }
    errors++;
  }
  validate26.errors = vErrors;
  return errors === 0;
}
validate26.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

function validate25(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate25.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.id === undefined) {
      const err0 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "id" },
        message: "must have required property '" + "id" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.display_name === undefined) {
      const err1 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "display_name" },
        message: "must have required property '" + "display_name" + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.engine === undefined) {
      const err2 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "engine" },
        message: "must have required property '" + "engine" + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.plugin === undefined) {
      const err3 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "plugin" },
        message: "must have required property '" + "plugin" + "'",
      };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(
        key0 === "description" ||
        key0 === "display_name" ||
        key0 === "endpoints" ||
        key0 === "engine" ||
        key0 === "id" ||
        key0 === "plugin"
      )) {
        const err4 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.description !== undefined) {
      if (typeof data.description !== "string") {
        const err5 = {
          instancePath: instancePath + "/description",
          schemaPath: "#/properties/description/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.display_name !== undefined) {
      if (typeof data.display_name !== "string") {
        const err6 = {
          instancePath: instancePath + "/display_name",
          schemaPath: "#/properties/display_name/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.endpoints !== undefined) {
      let data2 = data.endpoints;
      if (Array.isArray(data2)) {
        const len0 = data2.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (
            !validate26(data2[i0], {
              instancePath: instancePath + "/endpoints/" + i0,
              parentData: data2,
              parentDataProperty: i0,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors = vErrors === null ? validate26.errors : vErrors.concat(validate26.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err7 = {
          instancePath: instancePath + "/endpoints",
          schemaPath: "#/properties/endpoints/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array",
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
    if (data.engine !== undefined) {
      if (typeof data.engine !== "string") {
        const err8 = {
          instancePath: instancePath + "/engine",
          schemaPath: "#/properties/engine/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.id !== undefined) {
      if (typeof data.id !== "string") {
        const err9 = {
          instancePath: instancePath + "/id",
          schemaPath: "#/properties/id/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
    if (data.plugin !== undefined) {
      let data6 = data.plugin;
      if (data6 && typeof data6 == "object" && !Array.isArray(data6)) {
        if (data6.id === undefined) {
          const err10 = {
            instancePath: instancePath + "/plugin",
            schemaPath: "#/$defs/InstalledPluginIdentity/required",
            keyword: "required",
            params: { missingProperty: "id" },
            message: "must have required property '" + "id" + "'",
          };
          if (vErrors === null) {
            vErrors = [err10];
          } else {
            vErrors.push(err10);
          }
          errors++;
        }
        if (data6.distribution === undefined) {
          const err11 = {
            instancePath: instancePath + "/plugin",
            schemaPath: "#/$defs/InstalledPluginIdentity/required",
            keyword: "required",
            params: { missingProperty: "distribution" },
            message: "must have required property '" + "distribution" + "'",
          };
          if (vErrors === null) {
            vErrors = [err11];
          } else {
            vErrors.push(err11);
          }
          errors++;
        }
        if (data6.version === undefined) {
          const err12 = {
            instancePath: instancePath + "/plugin",
            schemaPath: "#/$defs/InstalledPluginIdentity/required",
            keyword: "required",
            params: { missingProperty: "version" },
            message: "must have required property '" + "version" + "'",
          };
          if (vErrors === null) {
            vErrors = [err12];
          } else {
            vErrors.push(err12);
          }
          errors++;
        }
        for (const key1 in data6) {
          if (!(key1 === "distribution" || key1 === "id" || key1 === "version")) {
            const err13 = {
              instancePath: instancePath + "/plugin",
              schemaPath: "#/$defs/InstalledPluginIdentity/additionalProperties",
              keyword: "additionalProperties",
              params: { additionalProperty: key1 },
              message: "must NOT have additional properties",
            };
            if (vErrors === null) {
              vErrors = [err13];
            } else {
              vErrors.push(err13);
            }
            errors++;
          }
        }
        if (data6.distribution !== undefined) {
          if (typeof data6.distribution !== "string") {
            const err14 = {
              instancePath: instancePath + "/plugin/distribution",
              schemaPath: "#/$defs/InstalledPluginIdentity/properties/distribution/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string",
            };
            if (vErrors === null) {
              vErrors = [err14];
            } else {
              vErrors.push(err14);
            }
            errors++;
          }
        }
        if (data6.id !== undefined) {
          if (typeof data6.id !== "string") {
            const err15 = {
              instancePath: instancePath + "/plugin/id",
              schemaPath: "#/$defs/InstalledPluginIdentity/properties/id/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string",
            };
            if (vErrors === null) {
              vErrors = [err15];
            } else {
              vErrors.push(err15);
            }
            errors++;
          }
        }
        if (data6.version !== undefined) {
          if (typeof data6.version !== "string") {
            const err16 = {
              instancePath: instancePath + "/plugin/version",
              schemaPath: "#/$defs/InstalledPluginIdentity/properties/version/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string",
            };
            if (vErrors === null) {
              vErrors = [err16];
            } else {
              vErrors.push(err16);
            }
            errors++;
          }
        }
      } else {
        const err17 = {
          instancePath: instancePath + "/plugin",
          schemaPath: "#/$defs/InstalledPluginIdentity/type",
          keyword: "type",
          params: { type: "object" },
          message: "must be object",
        };
        if (vErrors === null) {
          vErrors = [err17];
        } else {
          vErrors.push(err17);
        }
        errors++;
      }
    }
  } else {
    const err18 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err18];
    } else {
      vErrors.push(err18);
    }
    errors++;
  }
  validate25.errors = vErrors;
  return errors === 0;
}
validate25.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

function validate24(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="urn:dander:control:contracts:v1:connector-catalog" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate24.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    for (const key0 in data) {
      if (!(key0 === "connectors")) {
        const err0 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
    if (data.connectors !== undefined) {
      let data0 = data.connectors;
      if (Array.isArray(data0)) {
        const len0 = data0.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (
            !validate25(data0[i0], {
              instancePath: instancePath + "/connectors/" + i0,
              parentData: data0,
              parentDataProperty: i0,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors = vErrors === null ? validate25.errors : vErrors.concat(validate25.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err1 = {
          instancePath: instancePath + "/connectors",
          schemaPath: "#/properties/connectors/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array",
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
  } else {
    const err2 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err2];
    } else {
      vErrors.push(err2);
    }
    errors++;
  }
  validate24.errors = vErrors;
  return errors === 0;
}
validate24.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

export const validateDeploymentPreview = validate29;
const schema44 = {
  $id: "urn:dander:control:contracts:v1:deployment-preview",
  $schema: "https://json-schema.org/draft/2020-12/schema",
  additionalProperties: false,
  properties: {
    affected_jobs: { items: { type: "string" }, title: "Affected Jobs", type: "array" },
    candidate_image: { title: "Candidate Image", type: "string" },
    plan_sha256: { pattern: "^[0-9a-f]{64}$", title: "Plan Sha256", type: "string" },
    plan_summary: { title: "Plan Summary", type: "string" },
    plan_text: { title: "Plan Text", type: "string" },
    revision: { title: "Revision", type: "string" },
  },
  required: ["revision", "candidate_image", "plan_sha256", "plan_summary", "plan_text"],
  title: "DeploymentPreviewResponse",
  type: "object",
};

function validate29(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="urn:dander:control:contracts:v1:deployment-preview" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate29.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.revision === undefined) {
      const err0 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "revision" },
        message: "must have required property '" + "revision" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.candidate_image === undefined) {
      const err1 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "candidate_image" },
        message: "must have required property '" + "candidate_image" + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.plan_sha256 === undefined) {
      const err2 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "plan_sha256" },
        message: "must have required property '" + "plan_sha256" + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.plan_summary === undefined) {
      const err3 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "plan_summary" },
        message: "must have required property '" + "plan_summary" + "'",
      };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    if (data.plan_text === undefined) {
      const err4 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "plan_text" },
        message: "must have required property '" + "plan_text" + "'",
      };
      if (vErrors === null) {
        vErrors = [err4];
      } else {
        vErrors.push(err4);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(
        key0 === "affected_jobs" ||
        key0 === "candidate_image" ||
        key0 === "plan_sha256" ||
        key0 === "plan_summary" ||
        key0 === "plan_text" ||
        key0 === "revision"
      )) {
        const err5 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.affected_jobs !== undefined) {
      let data0 = data.affected_jobs;
      if (Array.isArray(data0)) {
        const len0 = data0.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (typeof data0[i0] !== "string") {
            const err6 = {
              instancePath: instancePath + "/affected_jobs/" + i0,
              schemaPath: "#/properties/affected_jobs/items/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string",
            };
            if (vErrors === null) {
              vErrors = [err6];
            } else {
              vErrors.push(err6);
            }
            errors++;
          }
        }
      } else {
        const err7 = {
          instancePath: instancePath + "/affected_jobs",
          schemaPath: "#/properties/affected_jobs/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array",
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
    if (data.candidate_image !== undefined) {
      if (typeof data.candidate_image !== "string") {
        const err8 = {
          instancePath: instancePath + "/candidate_image",
          schemaPath: "#/properties/candidate_image/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.plan_sha256 !== undefined) {
      let data3 = data.plan_sha256;
      if (typeof data3 === "string") {
        if (!pattern4.test(data3)) {
          const err9 = {
            instancePath: instancePath + "/plan_sha256",
            schemaPath: "#/properties/plan_sha256/pattern",
            keyword: "pattern",
            params: { pattern: "^[0-9a-f]{64}$" },
            message: 'must match pattern "' + "^[0-9a-f]{64}$" + '"',
          };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
      } else {
        const err10 = {
          instancePath: instancePath + "/plan_sha256",
          schemaPath: "#/properties/plan_sha256/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.plan_summary !== undefined) {
      if (typeof data.plan_summary !== "string") {
        const err11 = {
          instancePath: instancePath + "/plan_summary",
          schemaPath: "#/properties/plan_summary/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
    if (data.plan_text !== undefined) {
      if (typeof data.plan_text !== "string") {
        const err12 = {
          instancePath: instancePath + "/plan_text",
          schemaPath: "#/properties/plan_text/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      }
    }
    if (data.revision !== undefined) {
      if (typeof data.revision !== "string") {
        const err13 = {
          instancePath: instancePath + "/revision",
          schemaPath: "#/properties/revision/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
    }
  } else {
    const err14 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err14];
    } else {
      vErrors.push(err14);
    }
    errors++;
  }
  validate29.errors = vErrors;
  return errors === 0;
}
validate29.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

export const validateGraphValidation = validate30;
const schema45 = {
  $defs: {
    GraphValidationDetail: {
      additionalProperties: false,
      properties: {
        location: { title: "Location", type: "string" },
        message: { title: "Message", type: "string" },
        type: { title: "Type", type: "string" },
      },
      required: ["location", "message", "type"],
      title: "GraphValidationDetail",
      type: "object",
    },
  },
  $id: "urn:dander:control:contracts:v1:graph-validation",
  $schema: "https://json-schema.org/draft/2020-12/schema",
  additionalProperties: false,
  properties: {
    content_sha256: { pattern: "^[0-9a-f]{64}$", title: "Content Sha256", type: "string" },
    graph_name: { title: "Graph Name", type: "string" },
    issues: { items: { $ref: "#/$defs/GraphValidationDetail" }, title: "Issues", type: "array" },
    valid: { title: "Valid", type: "boolean" },
  },
  required: ["valid", "graph_name", "content_sha256"],
  title: "GraphValidationResponse",
  type: "object",
};
const schema46 = {
  additionalProperties: false,
  properties: {
    location: { title: "Location", type: "string" },
    message: { title: "Message", type: "string" },
    type: { title: "Type", type: "string" },
  },
  required: ["location", "message", "type"],
  title: "GraphValidationDetail",
  type: "object",
};

function validate30(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="urn:dander:control:contracts:v1:graph-validation" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate30.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.valid === undefined) {
      const err0 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "valid" },
        message: "must have required property '" + "valid" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.graph_name === undefined) {
      const err1 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "graph_name" },
        message: "must have required property '" + "graph_name" + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.content_sha256 === undefined) {
      const err2 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "content_sha256" },
        message: "must have required property '" + "content_sha256" + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(
        key0 === "content_sha256" ||
        key0 === "graph_name" ||
        key0 === "issues" ||
        key0 === "valid"
      )) {
        const err3 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.content_sha256 !== undefined) {
      let data0 = data.content_sha256;
      if (typeof data0 === "string") {
        if (!pattern4.test(data0)) {
          const err4 = {
            instancePath: instancePath + "/content_sha256",
            schemaPath: "#/properties/content_sha256/pattern",
            keyword: "pattern",
            params: { pattern: "^[0-9a-f]{64}$" },
            message: 'must match pattern "' + "^[0-9a-f]{64}$" + '"',
          };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
      } else {
        const err5 = {
          instancePath: instancePath + "/content_sha256",
          schemaPath: "#/properties/content_sha256/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.graph_name !== undefined) {
      if (typeof data.graph_name !== "string") {
        const err6 = {
          instancePath: instancePath + "/graph_name",
          schemaPath: "#/properties/graph_name/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.issues !== undefined) {
      let data2 = data.issues;
      if (Array.isArray(data2)) {
        const len0 = data2.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data3 = data2[i0];
          if (data3 && typeof data3 == "object" && !Array.isArray(data3)) {
            if (data3.location === undefined) {
              const err7 = {
                instancePath: instancePath + "/issues/" + i0,
                schemaPath: "#/$defs/GraphValidationDetail/required",
                keyword: "required",
                params: { missingProperty: "location" },
                message: "must have required property '" + "location" + "'",
              };
              if (vErrors === null) {
                vErrors = [err7];
              } else {
                vErrors.push(err7);
              }
              errors++;
            }
            if (data3.message === undefined) {
              const err8 = {
                instancePath: instancePath + "/issues/" + i0,
                schemaPath: "#/$defs/GraphValidationDetail/required",
                keyword: "required",
                params: { missingProperty: "message" },
                message: "must have required property '" + "message" + "'",
              };
              if (vErrors === null) {
                vErrors = [err8];
              } else {
                vErrors.push(err8);
              }
              errors++;
            }
            if (data3.type === undefined) {
              const err9 = {
                instancePath: instancePath + "/issues/" + i0,
                schemaPath: "#/$defs/GraphValidationDetail/required",
                keyword: "required",
                params: { missingProperty: "type" },
                message: "must have required property '" + "type" + "'",
              };
              if (vErrors === null) {
                vErrors = [err9];
              } else {
                vErrors.push(err9);
              }
              errors++;
            }
            for (const key1 in data3) {
              if (!(key1 === "location" || key1 === "message" || key1 === "type")) {
                const err10 = {
                  instancePath: instancePath + "/issues/" + i0,
                  schemaPath: "#/$defs/GraphValidationDetail/additionalProperties",
                  keyword: "additionalProperties",
                  params: { additionalProperty: key1 },
                  message: "must NOT have additional properties",
                };
                if (vErrors === null) {
                  vErrors = [err10];
                } else {
                  vErrors.push(err10);
                }
                errors++;
              }
            }
            if (data3.location !== undefined) {
              if (typeof data3.location !== "string") {
                const err11 = {
                  instancePath: instancePath + "/issues/" + i0 + "/location",
                  schemaPath: "#/$defs/GraphValidationDetail/properties/location/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string",
                };
                if (vErrors === null) {
                  vErrors = [err11];
                } else {
                  vErrors.push(err11);
                }
                errors++;
              }
            }
            if (data3.message !== undefined) {
              if (typeof data3.message !== "string") {
                const err12 = {
                  instancePath: instancePath + "/issues/" + i0 + "/message",
                  schemaPath: "#/$defs/GraphValidationDetail/properties/message/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string",
                };
                if (vErrors === null) {
                  vErrors = [err12];
                } else {
                  vErrors.push(err12);
                }
                errors++;
              }
            }
            if (data3.type !== undefined) {
              if (typeof data3.type !== "string") {
                const err13 = {
                  instancePath: instancePath + "/issues/" + i0 + "/type",
                  schemaPath: "#/$defs/GraphValidationDetail/properties/type/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string",
                };
                if (vErrors === null) {
                  vErrors = [err13];
                } else {
                  vErrors.push(err13);
                }
                errors++;
              }
            }
          } else {
            const err14 = {
              instancePath: instancePath + "/issues/" + i0,
              schemaPath: "#/$defs/GraphValidationDetail/type",
              keyword: "type",
              params: { type: "object" },
              message: "must be object",
            };
            if (vErrors === null) {
              vErrors = [err14];
            } else {
              vErrors.push(err14);
            }
            errors++;
          }
        }
      } else {
        const err15 = {
          instancePath: instancePath + "/issues",
          schemaPath: "#/properties/issues/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array",
        };
        if (vErrors === null) {
          vErrors = [err15];
        } else {
          vErrors.push(err15);
        }
        errors++;
      }
    }
    if (data.valid !== undefined) {
      if (typeof data.valid !== "boolean") {
        const err16 = {
          instancePath: instancePath + "/valid",
          schemaPath: "#/properties/valid/type",
          keyword: "type",
          params: { type: "boolean" },
          message: "must be boolean",
        };
        if (vErrors === null) {
          vErrors = [err16];
        } else {
          vErrors.push(err16);
        }
        errors++;
      }
    }
  } else {
    const err17 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err17];
    } else {
      vErrors.push(err17);
    }
    errors++;
  }
  validate30.errors = vErrors;
  return errors === 0;
}
validate30.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

export const validateLogPage = validate31;
const schema47 = {
  $defs: {
    LogLevel: { enum: ["debug", "info", "warning", "error"], title: "LogLevel", type: "string" },
    LogRecord: {
      additionalProperties: false,
      properties: {
        code: { title: "Code", type: "string" },
        correlation_id: { title: "Correlation Id", type: "string" },
        level: { $ref: "#/$defs/LogLevel" },
        message: { title: "Message", type: "string" },
        timestamp: { title: "Timestamp", type: "string" },
      },
      required: ["timestamp", "level", "code", "message", "correlation_id"],
      title: "LogRecord",
      type: "object",
    },
  },
  $id: "urn:dander:control:contracts:v1:log-page",
  $schema: "https://json-schema.org/draft/2020-12/schema",
  additionalProperties: false,
  properties: {
    next_cursor: {
      anyOf: [{ type: "string" }, { type: "null" }],
      default: null,
      title: "Next Cursor",
    },
    records: { items: { $ref: "#/$defs/LogRecord" }, title: "Records", type: "array" },
  },
  required: ["records"],
  title: "LogPageResponse",
  type: "object",
};
const schema48 = {
  additionalProperties: false,
  properties: {
    code: { title: "Code", type: "string" },
    correlation_id: { title: "Correlation Id", type: "string" },
    level: { $ref: "#/$defs/LogLevel" },
    message: { title: "Message", type: "string" },
    timestamp: { title: "Timestamp", type: "string" },
  },
  required: ["timestamp", "level", "code", "message", "correlation_id"],
  title: "LogRecord",
  type: "object",
};
const schema49 = { enum: ["debug", "info", "warning", "error"], title: "LogLevel", type: "string" };

function validate32(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate32.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.timestamp === undefined) {
      const err0 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "timestamp" },
        message: "must have required property '" + "timestamp" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.level === undefined) {
      const err1 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "level" },
        message: "must have required property '" + "level" + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.code === undefined) {
      const err2 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "code" },
        message: "must have required property '" + "code" + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.message === undefined) {
      const err3 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "message" },
        message: "must have required property '" + "message" + "'",
      };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    if (data.correlation_id === undefined) {
      const err4 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "correlation_id" },
        message: "must have required property '" + "correlation_id" + "'",
      };
      if (vErrors === null) {
        vErrors = [err4];
      } else {
        vErrors.push(err4);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(
        key0 === "code" ||
        key0 === "correlation_id" ||
        key0 === "level" ||
        key0 === "message" ||
        key0 === "timestamp"
      )) {
        const err5 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.code !== undefined) {
      if (typeof data.code !== "string") {
        const err6 = {
          instancePath: instancePath + "/code",
          schemaPath: "#/properties/code/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.correlation_id !== undefined) {
      if (typeof data.correlation_id !== "string") {
        const err7 = {
          instancePath: instancePath + "/correlation_id",
          schemaPath: "#/properties/correlation_id/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
    if (data.level !== undefined) {
      let data2 = data.level;
      if (typeof data2 !== "string") {
        const err8 = {
          instancePath: instancePath + "/level",
          schemaPath: "#/$defs/LogLevel/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
      if (!(data2 === "debug" || data2 === "info" || data2 === "warning" || data2 === "error")) {
        const err9 = {
          instancePath: instancePath + "/level",
          schemaPath: "#/$defs/LogLevel/enum",
          keyword: "enum",
          params: { allowedValues: schema49.enum },
          message: "must be equal to one of the allowed values",
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
    if (data.message !== undefined) {
      if (typeof data.message !== "string") {
        const err10 = {
          instancePath: instancePath + "/message",
          schemaPath: "#/properties/message/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.timestamp !== undefined) {
      if (typeof data.timestamp !== "string") {
        const err11 = {
          instancePath: instancePath + "/timestamp",
          schemaPath: "#/properties/timestamp/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
  } else {
    const err12 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err12];
    } else {
      vErrors.push(err12);
    }
    errors++;
  }
  validate32.errors = vErrors;
  return errors === 0;
}
validate32.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

function validate31(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="urn:dander:control:contracts:v1:log-page" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate31.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.records === undefined) {
      const err0 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "records" },
        message: "must have required property '" + "records" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(key0 === "next_cursor" || key0 === "records")) {
        const err1 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
    if (data.next_cursor !== undefined) {
      let data0 = data.next_cursor;
      const _errs3 = errors;
      let valid1 = false;
      const _errs4 = errors;
      if (typeof data0 !== "string") {
        const err2 = {
          instancePath: instancePath + "/next_cursor",
          schemaPath: "#/properties/next_cursor/anyOf/0/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
      var _valid0 = _errs4 === errors;
      valid1 = valid1 || _valid0;
      const _errs6 = errors;
      if (data0 !== null) {
        const err3 = {
          instancePath: instancePath + "/next_cursor",
          schemaPath: "#/properties/next_cursor/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
      var _valid0 = _errs6 === errors;
      valid1 = valid1 || _valid0;
      if (!valid1) {
        const err4 = {
          instancePath: instancePath + "/next_cursor",
          schemaPath: "#/properties/next_cursor/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      } else {
        errors = _errs3;
        if (vErrors !== null) {
          if (_errs3) {
            vErrors.length = _errs3;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.records !== undefined) {
      let data1 = data.records;
      if (Array.isArray(data1)) {
        const len0 = data1.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (
            !validate32(data1[i0], {
              instancePath: instancePath + "/records/" + i0,
              parentData: data1,
              parentDataProperty: i0,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors = vErrors === null ? validate32.errors : vErrors.concat(validate32.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err5 = {
          instancePath: instancePath + "/records",
          schemaPath: "#/properties/records/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array",
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
  } else {
    const err6 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err6];
    } else {
      vErrors.push(err6);
    }
    errors++;
  }
  validate31.errors = vErrors;
  return errors === 0;
}
validate31.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

export const validateMutationResult = validate34;
const schema50 = {
  $defs: {
    RunState: {
      enum: ["queued", "running", "succeeded", "failed", "canceling", "canceled", "retrying"],
      title: "RunState",
      type: "string",
    },
  },
  $id: "urn:dander:control:contracts:v1:mutation-result",
  $schema: "https://json-schema.org/draft/2020-12/schema",
  additionalProperties: false,
  properties: {
    accepted: { title: "Accepted", type: "boolean" },
    operation: { enum: ["cancel", "replay"], title: "Operation", type: "string" },
    resulting_run_id: {
      anyOf: [{ type: "string" }, { type: "null" }],
      default: null,
      title: "Resulting Run Id",
    },
    run_id: { title: "Run Id", type: "string" },
    state: { $ref: "#/$defs/RunState" },
  },
  required: ["operation", "accepted", "run_id", "state"],
  title: "MutationResult",
  type: "object",
};
const schema51 = {
  enum: ["queued", "running", "succeeded", "failed", "canceling", "canceled", "retrying"],
  title: "RunState",
  type: "string",
};

function validate34(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="urn:dander:control:contracts:v1:mutation-result" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate34.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.operation === undefined) {
      const err0 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "operation" },
        message: "must have required property '" + "operation" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.accepted === undefined) {
      const err1 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "accepted" },
        message: "must have required property '" + "accepted" + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.run_id === undefined) {
      const err2 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "run_id" },
        message: "must have required property '" + "run_id" + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.state === undefined) {
      const err3 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "state" },
        message: "must have required property '" + "state" + "'",
      };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(
        key0 === "accepted" ||
        key0 === "operation" ||
        key0 === "resulting_run_id" ||
        key0 === "run_id" ||
        key0 === "state"
      )) {
        const err4 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.accepted !== undefined) {
      if (typeof data.accepted !== "boolean") {
        const err5 = {
          instancePath: instancePath + "/accepted",
          schemaPath: "#/properties/accepted/type",
          keyword: "type",
          params: { type: "boolean" },
          message: "must be boolean",
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.operation !== undefined) {
      let data1 = data.operation;
      if (typeof data1 !== "string") {
        const err6 = {
          instancePath: instancePath + "/operation",
          schemaPath: "#/properties/operation/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
      if (!(data1 === "cancel" || data1 === "replay")) {
        const err7 = {
          instancePath: instancePath + "/operation",
          schemaPath: "#/properties/operation/enum",
          keyword: "enum",
          params: { allowedValues: schema50.properties.operation.enum },
          message: "must be equal to one of the allowed values",
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
    if (data.resulting_run_id !== undefined) {
      let data2 = data.resulting_run_id;
      const _errs7 = errors;
      let valid1 = false;
      const _errs8 = errors;
      if (typeof data2 !== "string") {
        const err8 = {
          instancePath: instancePath + "/resulting_run_id",
          schemaPath: "#/properties/resulting_run_id/anyOf/0/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
      var _valid0 = _errs8 === errors;
      valid1 = valid1 || _valid0;
      const _errs10 = errors;
      if (data2 !== null) {
        const err9 = {
          instancePath: instancePath + "/resulting_run_id",
          schemaPath: "#/properties/resulting_run_id/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
      var _valid0 = _errs10 === errors;
      valid1 = valid1 || _valid0;
      if (!valid1) {
        const err10 = {
          instancePath: instancePath + "/resulting_run_id",
          schemaPath: "#/properties/resulting_run_id/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      } else {
        errors = _errs7;
        if (vErrors !== null) {
          if (_errs7) {
            vErrors.length = _errs7;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.run_id !== undefined) {
      if (typeof data.run_id !== "string") {
        const err11 = {
          instancePath: instancePath + "/run_id",
          schemaPath: "#/properties/run_id/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
    if (data.state !== undefined) {
      let data4 = data.state;
      if (typeof data4 !== "string") {
        const err12 = {
          instancePath: instancePath + "/state",
          schemaPath: "#/$defs/RunState/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      }
      if (!(
        data4 === "queued" ||
        data4 === "running" ||
        data4 === "succeeded" ||
        data4 === "failed" ||
        data4 === "canceling" ||
        data4 === "canceled" ||
        data4 === "retrying"
      )) {
        const err13 = {
          instancePath: instancePath + "/state",
          schemaPath: "#/$defs/RunState/enum",
          keyword: "enum",
          params: { allowedValues: schema51.enum },
          message: "must be equal to one of the allowed values",
        };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
    }
  } else {
    const err14 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err14];
    } else {
      vErrors.push(err14);
    }
    errors++;
  }
  validate34.errors = vErrors;
  return errors === 0;
}
validate34.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

export const validateOperationCatalog = validate35;
const schema52 = {
  $defs: {
    JsonValue: {},
    OperationDescriptor: {
      additionalProperties: false,
      properties: {
        description: { title: "Description", type: "string" },
        display_name: { title: "Display Name", type: "string" },
        kind: {
          enum: ["truncate_string", "trim_whitespace", "default_value", "filter_rows"],
          title: "Kind",
          type: "string",
        },
        parameters: {
          items: { $ref: "#/$defs/OperationParameter" },
          title: "Parameters",
          type: "array",
        },
      },
      required: ["kind", "display_name", "description"],
      title: "OperationDescriptor",
      type: "object",
    },
    OperationParameter: {
      additionalProperties: false,
      properties: {
        control: { title: "Control", type: "string" },
        default: { $ref: "#/$defs/JsonValue", default: null },
        display_name: { title: "Display Name", type: "string" },
        minimum: {
          anyOf: [{ type: "integer" }, { type: "null" }],
          default: null,
          title: "Minimum",
        },
        name: { title: "Name", type: "string" },
        operators: { items: { type: "string" }, title: "Operators", type: "array" },
        options: { items: { $ref: "#/$defs/JsonValue" }, title: "Options", type: "array" },
        required: { title: "Required", type: "boolean" },
      },
      required: ["name", "display_name", "control", "required"],
      title: "OperationParameter",
      type: "object",
    },
  },
  $id: "urn:dander:control:contracts:v1:operation-catalog",
  $schema: "https://json-schema.org/draft/2020-12/schema",
  additionalProperties: false,
  properties: {
    operations: {
      items: { $ref: "#/$defs/OperationDescriptor" },
      title: "Operations",
      type: "array",
    },
    schema_version: { const: 1, default: 1, title: "Schema Version", type: "integer" },
  },
  required: ["operations"],
  title: "OperationCatalogResponse",
  type: "object",
};
const schema53 = {
  additionalProperties: false,
  properties: {
    description: { title: "Description", type: "string" },
    display_name: { title: "Display Name", type: "string" },
    kind: {
      enum: ["truncate_string", "trim_whitespace", "default_value", "filter_rows"],
      title: "Kind",
      type: "string",
    },
    parameters: {
      items: { $ref: "#/$defs/OperationParameter" },
      title: "Parameters",
      type: "array",
    },
  },
  required: ["kind", "display_name", "description"],
  title: "OperationDescriptor",
  type: "object",
};
const schema54 = {
  additionalProperties: false,
  properties: {
    control: { title: "Control", type: "string" },
    default: { $ref: "#/$defs/JsonValue", default: null },
    display_name: { title: "Display Name", type: "string" },
    minimum: { anyOf: [{ type: "integer" }, { type: "null" }], default: null, title: "Minimum" },
    name: { title: "Name", type: "string" },
    operators: { items: { type: "string" }, title: "Operators", type: "array" },
    options: { items: { $ref: "#/$defs/JsonValue" }, title: "Options", type: "array" },
    required: { title: "Required", type: "boolean" },
  },
  required: ["name", "display_name", "control", "required"],
  title: "OperationParameter",
  type: "object",
};
const schema55 = {};

function validate37(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate37.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.name === undefined) {
      const err0 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "name" },
        message: "must have required property '" + "name" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.display_name === undefined) {
      const err1 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "display_name" },
        message: "must have required property '" + "display_name" + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.control === undefined) {
      const err2 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "control" },
        message: "must have required property '" + "control" + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.required === undefined) {
      const err3 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "required" },
        message: "must have required property '" + "required" + "'",
      };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(
        key0 === "control" ||
        key0 === "default" ||
        key0 === "display_name" ||
        key0 === "minimum" ||
        key0 === "name" ||
        key0 === "operators" ||
        key0 === "options" ||
        key0 === "required"
      )) {
        const err4 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.control !== undefined) {
      if (typeof data.control !== "string") {
        const err5 = {
          instancePath: instancePath + "/control",
          schemaPath: "#/properties/control/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.display_name !== undefined) {
      if (typeof data.display_name !== "string") {
        const err6 = {
          instancePath: instancePath + "/display_name",
          schemaPath: "#/properties/display_name/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.minimum !== undefined) {
      let data3 = data.minimum;
      const _errs8 = errors;
      let valid2 = false;
      const _errs9 = errors;
      if (!(typeof data3 == "number" && !(data3 % 1) && !isNaN(data3) && isFinite(data3))) {
        const err7 = {
          instancePath: instancePath + "/minimum",
          schemaPath: "#/properties/minimum/anyOf/0/type",
          keyword: "type",
          params: { type: "integer" },
          message: "must be integer",
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
      var _valid0 = _errs9 === errors;
      valid2 = valid2 || _valid0;
      const _errs11 = errors;
      if (data3 !== null) {
        const err8 = {
          instancePath: instancePath + "/minimum",
          schemaPath: "#/properties/minimum/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
      var _valid0 = _errs11 === errors;
      valid2 = valid2 || _valid0;
      if (!valid2) {
        const err9 = {
          instancePath: instancePath + "/minimum",
          schemaPath: "#/properties/minimum/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      } else {
        errors = _errs8;
        if (vErrors !== null) {
          if (_errs8) {
            vErrors.length = _errs8;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.name !== undefined) {
      if (typeof data.name !== "string") {
        const err10 = {
          instancePath: instancePath + "/name",
          schemaPath: "#/properties/name/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.operators !== undefined) {
      let data5 = data.operators;
      if (Array.isArray(data5)) {
        const len0 = data5.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (typeof data5[i0] !== "string") {
            const err11 = {
              instancePath: instancePath + "/operators/" + i0,
              schemaPath: "#/properties/operators/items/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string",
            };
            if (vErrors === null) {
              vErrors = [err11];
            } else {
              vErrors.push(err11);
            }
            errors++;
          }
        }
      } else {
        const err12 = {
          instancePath: instancePath + "/operators",
          schemaPath: "#/properties/operators/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array",
        };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      }
    }
    if (data.options !== undefined) {
      if (Array.isArray(data.options)) {
      } else {
        const err13 = {
          instancePath: instancePath + "/options",
          schemaPath: "#/properties/options/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array",
        };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
    }
    if (data.required !== undefined) {
      if (typeof data.required !== "boolean") {
        const err14 = {
          instancePath: instancePath + "/required",
          schemaPath: "#/properties/required/type",
          keyword: "type",
          params: { type: "boolean" },
          message: "must be boolean",
        };
        if (vErrors === null) {
          vErrors = [err14];
        } else {
          vErrors.push(err14);
        }
        errors++;
      }
    }
  } else {
    const err15 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err15];
    } else {
      vErrors.push(err15);
    }
    errors++;
  }
  validate37.errors = vErrors;
  return errors === 0;
}
validate37.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

function validate36(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate36.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.kind === undefined) {
      const err0 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "kind" },
        message: "must have required property '" + "kind" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.display_name === undefined) {
      const err1 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "display_name" },
        message: "must have required property '" + "display_name" + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.description === undefined) {
      const err2 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "description" },
        message: "must have required property '" + "description" + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(
        key0 === "description" ||
        key0 === "display_name" ||
        key0 === "kind" ||
        key0 === "parameters"
      )) {
        const err3 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.description !== undefined) {
      if (typeof data.description !== "string") {
        const err4 = {
          instancePath: instancePath + "/description",
          schemaPath: "#/properties/description/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.display_name !== undefined) {
      if (typeof data.display_name !== "string") {
        const err5 = {
          instancePath: instancePath + "/display_name",
          schemaPath: "#/properties/display_name/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.kind !== undefined) {
      let data2 = data.kind;
      if (typeof data2 !== "string") {
        const err6 = {
          instancePath: instancePath + "/kind",
          schemaPath: "#/properties/kind/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
      if (!(
        data2 === "truncate_string" ||
        data2 === "trim_whitespace" ||
        data2 === "default_value" ||
        data2 === "filter_rows"
      )) {
        const err7 = {
          instancePath: instancePath + "/kind",
          schemaPath: "#/properties/kind/enum",
          keyword: "enum",
          params: { allowedValues: schema53.properties.kind.enum },
          message: "must be equal to one of the allowed values",
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
    if (data.parameters !== undefined) {
      let data3 = data.parameters;
      if (Array.isArray(data3)) {
        const len0 = data3.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (
            !validate37(data3[i0], {
              instancePath: instancePath + "/parameters/" + i0,
              parentData: data3,
              parentDataProperty: i0,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors = vErrors === null ? validate37.errors : vErrors.concat(validate37.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err8 = {
          instancePath: instancePath + "/parameters",
          schemaPath: "#/properties/parameters/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array",
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
  } else {
    const err9 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err9];
    } else {
      vErrors.push(err9);
    }
    errors++;
  }
  validate36.errors = vErrors;
  return errors === 0;
}
validate36.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

function validate35(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="urn:dander:control:contracts:v1:operation-catalog" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate35.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.operations === undefined) {
      const err0 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "operations" },
        message: "must have required property '" + "operations" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(key0 === "operations" || key0 === "schema_version")) {
        const err1 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
    if (data.operations !== undefined) {
      let data0 = data.operations;
      if (Array.isArray(data0)) {
        const len0 = data0.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (
            !validate36(data0[i0], {
              instancePath: instancePath + "/operations/" + i0,
              parentData: data0,
              parentDataProperty: i0,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors = vErrors === null ? validate36.errors : vErrors.concat(validate36.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err2 = {
          instancePath: instancePath + "/operations",
          schemaPath: "#/properties/operations/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array",
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.schema_version !== undefined) {
      let data2 = data.schema_version;
      if (!(typeof data2 == "number" && !(data2 % 1) && !isNaN(data2) && isFinite(data2))) {
        const err3 = {
          instancePath: instancePath + "/schema_version",
          schemaPath: "#/properties/schema_version/type",
          keyword: "type",
          params: { type: "integer" },
          message: "must be integer",
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
      if (1 !== data2) {
        const err4 = {
          instancePath: instancePath + "/schema_version",
          schemaPath: "#/properties/schema_version/const",
          keyword: "const",
          params: { allowedValue: 1 },
          message: "must be equal to constant",
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
  } else {
    const err5 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err5];
    } else {
      vErrors.push(err5);
    }
    errors++;
  }
  validate35.errors = vErrors;
  return errors === 0;
}
validate35.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

export const validatePipelineGraph = validate40;
const schema57 = {
  $defs: {
    AcceptedValuesFieldTest: {
      additionalProperties: false,
      properties: {
        field: { default: null, title: "Field", type: "null" },
        kind: { const: "accepted_values", title: "Kind", type: "string" },
        metadata: { $ref: "#/$defs/JsonObject" },
        to: { default: null, title: "To", type: "null" },
        values: {
          items: { $ref: "#/$defs/JsonValue" },
          minItems: 1,
          title: "Values",
          type: "array",
        },
      },
      required: ["kind", "values"],
      title: "AcceptedValuesFieldTest",
      type: "object",
    },
    ComparisonOperator: {
      description: "Closed comparison grammar for ``filter_rows``.",
      enum: ["eq", "ne", "gt", "gte", "lt", "lte", "in", "not_in", "is_null", "is_not_null"],
      title: "ComparisonOperator",
      type: "string",
    },
    ConstantTransformation: {
      additionalProperties: false,
      properties: {
        arguments: { $ref: "#/$defs/EmptyObject" },
        constant: { $ref: "#/$defs/JsonValue" },
        expression: { default: null, title: "Expression", type: "null" },
        function: { default: null, title: "Function", type: "null" },
        inputs: { items: { type: "string" }, title: "Inputs", type: "array" },
        kind: { const: "constant", title: "Kind", type: "string" },
        metadata: { $ref: "#/$defs/JsonObject" },
      },
      required: ["kind", "constant"],
      title: "ConstantTransformation",
      type: "object",
    },
    CursorStrategyDocument: {
      additionalProperties: false,
      properties: {
        field: { minLength: 1, title: "Field", type: "string" },
        kind: { enum: ["timestamp", "sequence", "opaque_token"], title: "Kind", type: "string" },
        metadata: { $ref: "#/$defs/JsonObject" },
        params: { $ref: "#/$defs/JsonObject" },
      },
      required: ["field", "kind"],
      title: "CursorStrategyDocument",
      type: "object",
    },
    CustomCodeTransformation: {
      additionalProperties: false,
      properties: {
        arguments: { $ref: "#/$defs/JsonObject" },
        constant: { default: null, title: "Constant", type: "null" },
        expression: { default: null, title: "Expression", type: "null" },
        function: {
          pattern: "^[A-Za-z_][A-Za-z0-9_]*(\\.[A-Za-z_][A-Za-z0-9_]*)*$",
          title: "Function",
          type: "string",
        },
        inputs: { items: { type: "string" }, title: "Inputs", type: "array" },
        kind: { const: "custom_code", title: "Kind", type: "string" },
        metadata: { $ref: "#/$defs/JsonObject" },
      },
      required: ["kind", "function"],
      title: "CustomCodeTransformation",
      type: "object",
    },
    DefaultValueOperation: {
      additionalProperties: false,
      properties: {
        kind: { const: "default_value", title: "Kind", type: "string" },
        metadata: { $ref: "#/$defs/JsonObject" },
        params: { $ref: "#/$defs/DefaultValueParamsDocument" },
      },
      required: ["kind", "params"],
      title: "DefaultValueOperation",
      type: "object",
    },
    DefaultValueParamsDocument: {
      additionalProperties: false,
      properties: {
        default: {
          anyOf: [{ type: "string" }, { type: "integer" }, { type: "number" }, { type: "boolean" }],
          title: "Default",
        },
        field: { pattern: "^[A-Za-z_][A-Za-z0-9_]*$", title: "Field", type: "string" },
      },
      required: ["field", "default"],
      title: "DefaultValueParamsDocument",
      type: "object",
    },
    DependencyTrigger: {
      additionalProperties: false,
      properties: {
        cron: { default: null, title: "Cron", type: "null" },
        depends_on: { items: { type: "string" }, minItems: 1, title: "Depends On", type: "array" },
        event: { default: null, title: "Event", type: "null" },
        kind: { const: "dependency", title: "Kind", type: "string" },
        metadata: { $ref: "#/$defs/JsonObject" },
      },
      required: ["kind", "depends_on"],
      title: "DependencyTrigger",
      type: "object",
    },
    DestinationDocument: {
      additionalProperties: false,
      properties: {
        business_key: { items: { type: "string" }, title: "Business Key", type: "array" },
        dataset: { minLength: 1, title: "Dataset", type: "string" },
        project: { anyOf: [{ type: "string" }, { type: "null" }], default: null, title: "Project" },
        table: { minLength: 1, title: "Table", type: "string" },
      },
      required: ["dataset", "table"],
      title: "DestinationDocument",
      type: "object",
    },
    DirectTransformation: {
      additionalProperties: false,
      properties: {
        arguments: { $ref: "#/$defs/EmptyObject" },
        constant: { default: null, title: "Constant", type: "null" },
        expression: { default: null, title: "Expression", type: "null" },
        function: { default: null, title: "Function", type: "null" },
        inputs: { items: { type: "string" }, title: "Inputs", type: "array" },
        kind: { const: "direct", default: "direct", title: "Kind", type: "string" },
        metadata: { $ref: "#/$defs/JsonObject" },
      },
      title: "DirectTransformation",
      type: "object",
    },
    EdgeDocument: {
      additionalProperties: false,
      properties: {
        from: { title: "From", type: "string" },
        join: { anyOf: [{ $ref: "#/$defs/JoinDocument" }, { type: "null" }], default: null },
        mappings: {
          items: { $ref: "#/$defs/FieldMappingDocument" },
          title: "Mappings",
          type: "array",
        },
        metadata: { $ref: "#/$defs/JsonObject" },
        to: { title: "To", type: "string" },
      },
      required: ["from", "to"],
      title: "EdgeDocument",
      type: "object",
    },
    EmptyObject: {
      additionalProperties: false,
      description: "A JSON object that must contain no properties.",
      properties: {},
      title: "EmptyObject",
      type: "object",
    },
    ExecutableJoinKeyDocument: {
      additionalProperties: false,
      properties: {
        left: { minLength: 1, title: "Left", type: "string" },
        right: { minLength: 1, title: "Right", type: "string" },
      },
      required: ["left", "right"],
      title: "ExecutableJoinKeyDocument",
      type: "object",
    },
    ExecutableJoinType: {
      description: "BigQuery join kinds supported by an executable transform node.",
      enum: ["inner", "left", "right", "full"],
      title: "ExecutableJoinType",
      type: "string",
    },
    ExpressionTransformation: {
      additionalProperties: false,
      properties: {
        arguments: { $ref: "#/$defs/EmptyObject" },
        constant: { default: null, title: "Constant", type: "null" },
        expression: { minLength: 1, title: "Expression", type: "string" },
        function: { default: null, title: "Function", type: "null" },
        inputs: { items: { type: "string" }, title: "Inputs", type: "array" },
        kind: { const: "expression", title: "Kind", type: "string" },
        metadata: { $ref: "#/$defs/JsonObject" },
      },
      required: ["kind", "expression"],
      title: "ExpressionTransformation",
      type: "object",
    },
    ExtensionNodeDocument: {
      additionalProperties: false,
      not: { required: ["config", "params"] },
      properties: {
        config: { $ref: "#/$defs/JsonObject" },
        cursor: {
          anyOf: [{ $ref: "#/$defs/CursorStrategyDocument" }, { type: "null" }],
          default: null,
        },
        fields: { items: { $ref: "#/$defs/NodeFieldDocument" }, title: "Fields", type: "array" },
        id: { title: "Id", type: "string" },
        name: { title: "Name", type: "string" },
        params: {
          anyOf: [{ $ref: "#/$defs/JsonObject" }, { type: "null" }],
          default: null,
          deprecated: true,
          "x-dander-canonical-name": "config",
        },
        trigger: { anyOf: [{ $ref: "#/$defs/TriggerDocument" }, { type: "null" }], default: null },
        type: { $ref: "#/$defs/ExtensionNodeType" },
        visual: {
          anyOf: [{ $ref: "#/$defs/NodeVisualDocument" }, { type: "null" }],
          default: null,
        },
      },
      required: ["id", "type", "name"],
      title: "ExtensionNodeDocument",
      type: "object",
    },
    ExtensionNodeType: { not: { enum: ["source", "transform", "target"] }, type: "string" },
    FieldConditionDocument: {
      additionalProperties: false,
      properties: {
        field: { pattern: "^[A-Za-z_][A-Za-z0-9_]*$", title: "Field", type: "string" },
        op: { $ref: "#/$defs/ComparisonOperator" },
        value: {
          anyOf: [
            { type: "string" },
            { type: "integer" },
            { type: "number" },
            { type: "boolean" },
            {
              items: {
                anyOf: [
                  { type: "string" },
                  { type: "integer" },
                  { type: "number" },
                  { type: "boolean" },
                ],
              },
              type: "array",
            },
            { type: "null" },
          ],
          default: null,
          title: "Value",
        },
      },
      required: ["field", "op"],
      title: "FieldConditionDocument",
      type: "object",
    },
    FieldMappingDocument: {
      additionalProperties: false,
      properties: {
        metadata: { $ref: "#/$defs/JsonObject" },
        source: { anyOf: [{ type: "string" }, { type: "null" }], default: null, title: "Source" },
        target: { title: "Target", type: "string" },
        transformation: {
          anyOf: [{ $ref: "#/$defs/TransformationDocument" }, { type: "null" }],
          default: null,
        },
      },
      required: ["target"],
      title: "FieldMappingDocument",
      type: "object",
    },
    FieldTestDocument: {
      anyOf: [
        { $ref: "#/$defs/NotNullFieldTest" },
        { $ref: "#/$defs/UniqueFieldTest" },
        { $ref: "#/$defs/AcceptedValuesFieldTest" },
        { $ref: "#/$defs/RelationshipsFieldTest" },
      ],
    },
    FilterRowsOperation: {
      additionalProperties: false,
      properties: {
        kind: { const: "filter_rows", title: "Kind", type: "string" },
        metadata: { $ref: "#/$defs/JsonObject" },
        params: { $ref: "#/$defs/FilterRowsParamsDocument" },
      },
      required: ["kind", "params"],
      title: "FilterRowsOperation",
      type: "object",
    },
    FilterRowsParamsDocument: {
      additionalProperties: false,
      properties: {
        conditions: {
          items: { $ref: "#/$defs/FieldConditionDocument" },
          minItems: 1,
          title: "Conditions",
          type: "array",
        },
        logic: { $ref: "#/$defs/MatchLogic", default: "all" },
      },
      required: ["conditions"],
      title: "FilterRowsParamsDocument",
      type: "object",
    },
    GraphNodeDocument: {
      anyOf: [
        { $ref: "#/$defs/SourceNodeDocument" },
        { $ref: "#/$defs/TransformNodeDocument" },
        { $ref: "#/$defs/TargetNodeDocument" },
        { $ref: "#/$defs/ExtensionNodeDocument" },
      ],
    },
    HttpMethod: {
      description:
        "The closed set of HTTP methods a `RequestSpec` may declare.\n\nA `StrEnum` (matching the `TransformationKind`/`JoinType` convention in `graph.py`) so callers\nget a named, importable type that still serializes to/from its plain string value stably in\nYAML and JSON. An out-of-set value fails validation with a clear error at the Pydantic\nboundary. `HEAD`/`OPTIONS` are intentionally omitted (no source currently needs them); extend\nby adding a member later without touching callers.\n\nAttributes:\n    GET: Retrieve a resource. The default method (a simple GET needs no explicit spec).\n    POST: Create a resource / submit a query body.\n    PUT: Replace a resource.\n    PATCH: Partially update a resource.\n    DELETE: Remove a resource.",
      enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      title: "HttpMethod",
      type: "string",
    },
    JoinDocument: {
      additionalProperties: false,
      properties: {
        keys: {
          items: { $ref: "#/$defs/JoinKeyPairDocument" },
          minItems: 1,
          title: "Keys",
          type: "array",
        },
        metadata: { $ref: "#/$defs/JsonObject" },
        type: { enum: ["inner", "left", "right", "full"], title: "Type", type: "string" },
      },
      required: ["type", "keys"],
      title: "JoinDocument",
      type: "object",
    },
    JoinKeyPairDocument: {
      additionalProperties: false,
      properties: {
        left: { title: "Left", type: "string" },
        right: { title: "Right", type: "string" },
      },
      required: ["left", "right"],
      title: "JoinKeyPairDocument",
      type: "object",
    },
    JsonObject: { additionalProperties: { $ref: "#/$defs/JsonValue" }, type: "object" },
    JsonValue: {},
    ManualTrigger: {
      additionalProperties: false,
      properties: {
        cron: { default: null, title: "Cron", type: "null" },
        depends_on: { items: { type: "string" }, maxItems: 0, title: "Depends On", type: "array" },
        event: { anyOf: [{ type: "string" }, { type: "null" }], default: null, title: "Event" },
        kind: { const: "manual", title: "Kind", type: "string" },
        metadata: { $ref: "#/$defs/JsonObject" },
      },
      required: ["kind"],
      title: "ManualTrigger",
      type: "object",
    },
    MatchLogic: {
      description: "How a filter's flat condition list combines.",
      enum: ["all", "any"],
      title: "MatchLogic",
      type: "string",
    },
    NodeFieldDocument: {
      additionalProperties: false,
      properties: {
        cast_to: { anyOf: [{ type: "string" }, { type: "null" }], default: null, title: "Cast To" },
        description: {
          anyOf: [{ type: "string" }, { type: "null" }],
          default: null,
          title: "Description",
        },
        extensions: {
          items: { $ref: "#/$defs/ProviderExtension" },
          title: "Extensions",
          type: "array",
        },
        metadata: { $ref: "#/$defs/JsonObject" },
        name: { title: "Name", type: "string" },
        nullable: { default: true, title: "Nullable", type: "boolean" },
        tests: { items: { $ref: "#/$defs/FieldTestDocument" }, title: "Tests", type: "array" },
        type: { title: "Type", type: "string" },
      },
      required: ["name", "type"],
      title: "NodeFieldDocument",
      type: "object",
    },
    NodeVisualDocument: {
      additionalProperties: false,
      properties: {
        color: { anyOf: [{ type: "string" }, { type: "null" }], default: null, title: "Color" },
        icon: { anyOf: [{ type: "string" }, { type: "null" }], default: null, title: "Icon" },
        position: {
          anyOf: [{ $ref: "#/$defs/PositionDocument" }, { type: "null" }],
          default: null,
        },
      },
      title: "NodeVisualDocument",
      type: "object",
    },
    NotNullFieldTest: {
      additionalProperties: false,
      properties: {
        field: { default: null, title: "Field", type: "null" },
        kind: { const: "not_null", title: "Kind", type: "string" },
        metadata: { $ref: "#/$defs/JsonObject" },
        to: { default: null, title: "To", type: "null" },
        values: {
          items: { $ref: "#/$defs/JsonValue" },
          maxItems: 0,
          title: "Values",
          type: "array",
        },
      },
      required: ["kind"],
      title: "NotNullFieldTest",
      type: "object",
    },
    OperationDocument: {
      anyOf: [
        { $ref: "#/$defs/TruncateStringOperation" },
        { $ref: "#/$defs/TrimWhitespaceOperation" },
        { $ref: "#/$defs/DefaultValueOperation" },
        { $ref: "#/$defs/FilterRowsOperation" },
      ],
    },
    PartitioningDocument: {
      additionalProperties: false,
      properties: {
        field: { anyOf: [{ type: "string" }, { type: "null" }], default: null, title: "Field" },
        granularity: { $ref: "#/$defs/PartitioningType", default: "day" },
        require_partition_filter: {
          default: false,
          title: "Require Partition Filter",
          type: "boolean",
        },
      },
      title: "PartitioningDocument",
      type: "object",
    },
    PartitioningType: {
      description:
        "The closed set of time-unit partitioning granularities a `PartitioningSpec` may declare.\n\nA `StrEnum` (matching the `WriteMode`/`TransformationKind`/`JoinType` convention elsewhere in\n`dander.pipeline`), so it serializes to/from its plain string value stably in YAML and JSON;\nan out-of-set value fails validation with a clear `ValidationError`. Scope is deliberately\nlimited to BigQuery time-unit partitioning — integer-range partitioning is a deferred future\nmember (see `steering/02-engineering.md` on avoiding speculative generality).\n\nAttributes:\n    HOUR: Hourly partitions.\n    DAY: Daily partitions — the common case and BigQuery's default granularity.\n    MONTH: Monthly partitions.\n    YEAR: Yearly partitions.",
      enum: ["hour", "day", "month", "year"],
      title: "PartitioningType",
      type: "string",
    },
    PositionDocument: {
      additionalProperties: false,
      properties: { x: { title: "X", type: "number" }, y: { title: "Y", type: "number" } },
      required: ["x", "y"],
      title: "PositionDocument",
      type: "object",
    },
    ProviderExtension: {
      additionalProperties: false,
      description: "One deterministic provider-specific schema annotation, never a credential.",
      properties: {
        name: { title: "Name", type: "string" },
        provider: { title: "Provider", type: "string" },
        value: {
          anyOf: [{ type: "string" }, { type: "integer" }, { type: "number" }, { type: "boolean" }],
          title: "Value",
        },
      },
      required: ["provider", "name", "value"],
      title: "ProviderExtension",
      type: "object",
    },
    RelationshipsFieldTest: {
      additionalProperties: false,
      properties: {
        field: { minLength: 1, title: "Field", type: "string" },
        kind: { const: "relationships", title: "Kind", type: "string" },
        metadata: { $ref: "#/$defs/JsonObject" },
        to: { minLength: 1, title: "To", type: "string" },
        values: {
          items: { $ref: "#/$defs/JsonValue" },
          maxItems: 0,
          title: "Values",
          type: "array",
        },
      },
      required: ["kind", "to", "field"],
      title: "RelationshipsFieldTest",
      type: "object",
    },
    RequestSpecDocument: {
      additionalProperties: false,
      properties: {
        body: {
          anyOf: [{ $ref: "#/$defs/JsonObject" }, { type: "string" }, { type: "null" }],
          default: null,
          title: "Body",
        },
        headers: { additionalProperties: { type: "string" }, title: "Headers", type: "object" },
        method: { $ref: "#/$defs/HttpMethod", default: "GET" },
        query_params: {
          additionalProperties: { type: "string" },
          title: "Query Params",
          type: "object",
        },
      },
      title: "RequestSpecDocument",
      type: "object",
    },
    ScheduleTrigger: {
      additionalProperties: false,
      properties: {
        cron: { minLength: 1, title: "Cron", type: "string" },
        depends_on: { items: { type: "string" }, maxItems: 0, title: "Depends On", type: "array" },
        event: { default: null, title: "Event", type: "null" },
        kind: { const: "schedule", title: "Kind", type: "string" },
        metadata: { $ref: "#/$defs/JsonObject" },
      },
      required: ["kind", "cron"],
      title: "ScheduleTrigger",
      type: "object",
    },
    SchemaEvolution: {
      description: "How a writer handles declared columns absent from an existing target.",
      enum: ["strict", "additive"],
      title: "SchemaEvolution",
      type: "string",
    },
    SourceNodeConfigDocument: {
      additionalProperties: { $ref: "#/$defs/JsonValue" },
      properties: {
        connector: {
          anyOf: [{ type: "string" }, { type: "null" }],
          default: null,
          title: "Connector",
        },
        endpoint: {
          anyOf: [{ type: "string" }, { type: "null" }],
          default: null,
          title: "Endpoint",
        },
        request: {
          anyOf: [{ $ref: "#/$defs/RequestSpecDocument" }, { type: "null" }],
          default: null,
        },
      },
      title: "SourceNodeConfigDocument",
      type: "object",
    },
    SourceNodeDocument: {
      additionalProperties: false,
      not: { required: ["config", "params"] },
      properties: {
        config: { $ref: "#/$defs/SourceNodeConfigDocument" },
        cursor: {
          anyOf: [{ $ref: "#/$defs/CursorStrategyDocument" }, { type: "null" }],
          default: null,
        },
        fields: { items: { $ref: "#/$defs/NodeFieldDocument" }, title: "Fields", type: "array" },
        id: { title: "Id", type: "string" },
        name: { title: "Name", type: "string" },
        params: {
          anyOf: [{ $ref: "#/$defs/SourceNodeConfigDocument" }, { type: "null" }],
          default: null,
          deprecated: true,
          "x-dander-canonical-name": "config",
        },
        trigger: { anyOf: [{ $ref: "#/$defs/TriggerDocument" }, { type: "null" }], default: null },
        type: { const: "source", title: "Type", type: "string" },
        visual: {
          anyOf: [{ $ref: "#/$defs/NodeVisualDocument" }, { type: "null" }],
          default: null,
        },
      },
      required: ["id", "type", "name"],
      title: "SourceNodeDocument",
      type: "object",
    },
    TargetNodeConfigDocument: {
      additionalProperties: { $ref: "#/$defs/JsonValue" },
      properties: {
        writer: { anyOf: [{ $ref: "#/$defs/WriterDocument" }, { type: "null" }], default: null },
      },
      title: "TargetNodeConfigDocument",
      type: "object",
    },
    TargetNodeDocument: {
      additionalProperties: false,
      not: { required: ["config", "params"] },
      properties: {
        config: { $ref: "#/$defs/TargetNodeConfigDocument" },
        cursor: {
          anyOf: [{ $ref: "#/$defs/CursorStrategyDocument" }, { type: "null" }],
          default: null,
        },
        fields: { items: { $ref: "#/$defs/NodeFieldDocument" }, title: "Fields", type: "array" },
        id: { title: "Id", type: "string" },
        name: { title: "Name", type: "string" },
        params: {
          anyOf: [{ $ref: "#/$defs/TargetNodeConfigDocument" }, { type: "null" }],
          default: null,
          deprecated: true,
          "x-dander-canonical-name": "config",
        },
        trigger: { anyOf: [{ $ref: "#/$defs/TriggerDocument" }, { type: "null" }], default: null },
        type: { const: "target", title: "Type", type: "string" },
        visual: {
          anyOf: [{ $ref: "#/$defs/NodeVisualDocument" }, { type: "null" }],
          default: null,
        },
      },
      required: ["id", "type", "name"],
      title: "TargetNodeDocument",
      type: "object",
    },
    TransformJoinDocument: {
      additionalProperties: false,
      properties: {
        keys: {
          items: { $ref: "#/$defs/ExecutableJoinKeyDocument" },
          minItems: 1,
          title: "Keys",
          type: "array",
        },
        left_input: { minLength: 1, title: "Left Input", type: "string" },
        right_input: { minLength: 1, title: "Right Input", type: "string" },
        type: { $ref: "#/$defs/ExecutableJoinType" },
      },
      required: ["left_input", "right_input", "type", "keys"],
      title: "TransformJoinDocument",
      type: "object",
    },
    TransformNodeConfigDocument: {
      additionalProperties: { $ref: "#/$defs/JsonValue" },
      properties: {
        join: {
          anyOf: [{ $ref: "#/$defs/TransformJoinDocument" }, { type: "null" }],
          default: null,
        },
        operations: {
          items: { $ref: "#/$defs/OperationDocument" },
          title: "Operations",
          type: "array",
        },
      },
      title: "TransformNodeConfigDocument",
      type: "object",
    },
    TransformNodeDocument: {
      additionalProperties: false,
      not: { required: ["config", "params"] },
      properties: {
        config: { $ref: "#/$defs/TransformNodeConfigDocument" },
        cursor: {
          anyOf: [{ $ref: "#/$defs/CursorStrategyDocument" }, { type: "null" }],
          default: null,
        },
        fields: { items: { $ref: "#/$defs/NodeFieldDocument" }, title: "Fields", type: "array" },
        id: { title: "Id", type: "string" },
        name: { title: "Name", type: "string" },
        params: {
          anyOf: [{ $ref: "#/$defs/TransformNodeConfigDocument" }, { type: "null" }],
          default: null,
          deprecated: true,
          "x-dander-canonical-name": "config",
        },
        trigger: { anyOf: [{ $ref: "#/$defs/TriggerDocument" }, { type: "null" }], default: null },
        type: { const: "transform", title: "Type", type: "string" },
        visual: {
          anyOf: [{ $ref: "#/$defs/NodeVisualDocument" }, { type: "null" }],
          default: null,
        },
      },
      required: ["id", "type", "name"],
      title: "TransformNodeDocument",
      type: "object",
    },
    TransformationDocument: {
      anyOf: [
        { $ref: "#/$defs/DirectTransformation" },
        { $ref: "#/$defs/ExpressionTransformation" },
        { $ref: "#/$defs/ConstantTransformation" },
        { $ref: "#/$defs/CustomCodeTransformation" },
      ],
    },
    TriggerDocument: {
      anyOf: [
        { $ref: "#/$defs/ScheduleTrigger" },
        { $ref: "#/$defs/DependencyTrigger" },
        { $ref: "#/$defs/ManualTrigger" },
      ],
    },
    TrimWhitespaceOperation: {
      additionalProperties: false,
      properties: {
        kind: { const: "trim_whitespace", title: "Kind", type: "string" },
        metadata: { $ref: "#/$defs/JsonObject" },
        params: { $ref: "#/$defs/TrimWhitespaceParamsDocument" },
      },
      required: ["kind", "params"],
      title: "TrimWhitespaceOperation",
      type: "object",
    },
    TrimWhitespaceParamsDocument: {
      additionalProperties: false,
      properties: {
        field: { pattern: "^[A-Za-z_][A-Za-z0-9_]*$", title: "Field", type: "string" },
      },
      required: ["field"],
      title: "TrimWhitespaceParamsDocument",
      type: "object",
    },
    TruncateStringOperation: {
      additionalProperties: false,
      properties: {
        kind: { const: "truncate_string", title: "Kind", type: "string" },
        metadata: { $ref: "#/$defs/JsonObject" },
        params: { $ref: "#/$defs/TruncateStringParamsDocument" },
      },
      required: ["kind", "params"],
      title: "TruncateStringOperation",
      type: "object",
    },
    TruncateStringParamsDocument: {
      additionalProperties: false,
      properties: {
        field: { pattern: "^[A-Za-z_][A-Za-z0-9_]*$", title: "Field", type: "string" },
        max_length: { minimum: 0, title: "Max Length", type: "integer" },
      },
      required: ["field", "max_length"],
      title: "TruncateStringParamsDocument",
      type: "object",
    },
    UniqueFieldTest: {
      additionalProperties: false,
      properties: {
        field: { default: null, title: "Field", type: "null" },
        kind: { const: "unique", title: "Kind", type: "string" },
        metadata: { $ref: "#/$defs/JsonObject" },
        to: { default: null, title: "To", type: "null" },
        values: {
          items: { $ref: "#/$defs/JsonValue" },
          maxItems: 0,
          title: "Values",
          type: "array",
        },
      },
      required: ["kind"],
      title: "UniqueFieldTest",
      type: "object",
    },
    WriteMode: {
      description: "Supported load strategies.",
      enum: ["scd1", "scd2", "snapshot", "incremental", "replace"],
      title: "WriteMode",
      type: "string",
    },
    WriterDocument: {
      additionalProperties: false,
      properties: {
        clustering: { items: { type: "string" }, maxItems: 4, title: "Clustering", type: "array" },
        cursor_field: {
          anyOf: [{ type: "string" }, { type: "null" }],
          default: null,
          title: "Cursor Field",
        },
        destination: { $ref: "#/$defs/DestinationDocument" },
        max_batch_rows: {
          default: 10000,
          exclusiveMinimum: 0,
          maximum: 100000,
          title: "Max Batch Rows",
          type: "integer",
        },
        partitioning: {
          anyOf: [{ $ref: "#/$defs/PartitioningDocument" }, { type: "null" }],
          default: null,
        },
        schema_evolution: { $ref: "#/$defs/SchemaEvolution", default: "strict" },
        transport: {
          default: "load_job",
          enum: ["load_job", "storage_write", "copy"],
          title: "Transport",
          type: "string",
        },
        write_mode: { $ref: "#/$defs/WriteMode" },
      },
      required: ["write_mode", "destination"],
      title: "WriterDocument",
      type: "object",
    },
  },
  $id: "urn:dander:control:contracts:v1:pipeline-graph",
  $schema: "https://json-schema.org/draft/2020-12/schema",
  additionalProperties: false,
  description: "Canonical graph transport whose construction reuses Dander semantic validation.",
  properties: {
    edges: { items: { $ref: "#/$defs/EdgeDocument" }, title: "Edges", type: "array" },
    name: { title: "Name", type: "string" },
    nodes: { items: { $ref: "#/$defs/GraphNodeDocument" }, title: "Nodes", type: "array" },
    trigger: { anyOf: [{ $ref: "#/$defs/TriggerDocument" }, { type: "null" }], default: null },
  },
  required: ["name"],
  title: "PipelineGraphDocument",
  type: "object",
};
const schema58 = {
  additionalProperties: false,
  properties: {
    from: { title: "From", type: "string" },
    join: { anyOf: [{ $ref: "#/$defs/JoinDocument" }, { type: "null" }], default: null },
    mappings: { items: { $ref: "#/$defs/FieldMappingDocument" }, title: "Mappings", type: "array" },
    metadata: { $ref: "#/$defs/JsonObject" },
    to: { title: "To", type: "string" },
  },
  required: ["from", "to"],
  title: "EdgeDocument",
  type: "object",
};
const schema59 = {
  additionalProperties: false,
  properties: {
    keys: {
      items: { $ref: "#/$defs/JoinKeyPairDocument" },
      minItems: 1,
      title: "Keys",
      type: "array",
    },
    metadata: { $ref: "#/$defs/JsonObject" },
    type: { enum: ["inner", "left", "right", "full"], title: "Type", type: "string" },
  },
  required: ["type", "keys"],
  title: "JoinDocument",
  type: "object",
};
const schema60 = {
  additionalProperties: false,
  properties: {
    left: { title: "Left", type: "string" },
    right: { title: "Right", type: "string" },
  },
  required: ["left", "right"],
  title: "JoinKeyPairDocument",
  type: "object",
};
const schema61 = { additionalProperties: { $ref: "#/$defs/JsonValue" }, type: "object" };
const schema62 = {};

function validate43(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate43.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
  } else {
    const err0 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
  }
  validate43.errors = vErrors;
  return errors === 0;
}
validate43.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

function validate42(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate42.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.type === undefined) {
      const err0 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "type" },
        message: "must have required property '" + "type" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.keys === undefined) {
      const err1 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "keys" },
        message: "must have required property '" + "keys" + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(key0 === "keys" || key0 === "metadata" || key0 === "type")) {
        const err2 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.keys !== undefined) {
      let data0 = data.keys;
      if (Array.isArray(data0)) {
        if (data0.length < 1) {
          const err3 = {
            instancePath: instancePath + "/keys",
            schemaPath: "#/properties/keys/minItems",
            keyword: "minItems",
            params: { limit: 1 },
            message: "must NOT have fewer than 1 items",
          };
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        }
        const len0 = data0.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data1 = data0[i0];
          if (data1 && typeof data1 == "object" && !Array.isArray(data1)) {
            if (data1.left === undefined) {
              const err4 = {
                instancePath: instancePath + "/keys/" + i0,
                schemaPath: "#/$defs/JoinKeyPairDocument/required",
                keyword: "required",
                params: { missingProperty: "left" },
                message: "must have required property '" + "left" + "'",
              };
              if (vErrors === null) {
                vErrors = [err4];
              } else {
                vErrors.push(err4);
              }
              errors++;
            }
            if (data1.right === undefined) {
              const err5 = {
                instancePath: instancePath + "/keys/" + i0,
                schemaPath: "#/$defs/JoinKeyPairDocument/required",
                keyword: "required",
                params: { missingProperty: "right" },
                message: "must have required property '" + "right" + "'",
              };
              if (vErrors === null) {
                vErrors = [err5];
              } else {
                vErrors.push(err5);
              }
              errors++;
            }
            for (const key1 in data1) {
              if (!(key1 === "left" || key1 === "right")) {
                const err6 = {
                  instancePath: instancePath + "/keys/" + i0,
                  schemaPath: "#/$defs/JoinKeyPairDocument/additionalProperties",
                  keyword: "additionalProperties",
                  params: { additionalProperty: key1 },
                  message: "must NOT have additional properties",
                };
                if (vErrors === null) {
                  vErrors = [err6];
                } else {
                  vErrors.push(err6);
                }
                errors++;
              }
            }
            if (data1.left !== undefined) {
              if (typeof data1.left !== "string") {
                const err7 = {
                  instancePath: instancePath + "/keys/" + i0 + "/left",
                  schemaPath: "#/$defs/JoinKeyPairDocument/properties/left/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string",
                };
                if (vErrors === null) {
                  vErrors = [err7];
                } else {
                  vErrors.push(err7);
                }
                errors++;
              }
            }
            if (data1.right !== undefined) {
              if (typeof data1.right !== "string") {
                const err8 = {
                  instancePath: instancePath + "/keys/" + i0 + "/right",
                  schemaPath: "#/$defs/JoinKeyPairDocument/properties/right/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string",
                };
                if (vErrors === null) {
                  vErrors = [err8];
                } else {
                  vErrors.push(err8);
                }
                errors++;
              }
            }
          } else {
            const err9 = {
              instancePath: instancePath + "/keys/" + i0,
              schemaPath: "#/$defs/JoinKeyPairDocument/type",
              keyword: "type",
              params: { type: "object" },
              message: "must be object",
            };
            if (vErrors === null) {
              vErrors = [err9];
            } else {
              vErrors.push(err9);
            }
            errors++;
          }
        }
      } else {
        const err10 = {
          instancePath: instancePath + "/keys",
          schemaPath: "#/properties/keys/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array",
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.metadata !== undefined) {
      if (
        !validate43(data.metadata, {
          instancePath: instancePath + "/metadata",
          parentData: data,
          parentDataProperty: "metadata",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate43.errors : vErrors.concat(validate43.errors);
        errors = vErrors.length;
      }
    }
    if (data.type !== undefined) {
      let data5 = data.type;
      if (typeof data5 !== "string") {
        const err11 = {
          instancePath: instancePath + "/type",
          schemaPath: "#/properties/type/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
      if (!(data5 === "inner" || data5 === "left" || data5 === "right" || data5 === "full")) {
        const err12 = {
          instancePath: instancePath + "/type",
          schemaPath: "#/properties/type/enum",
          keyword: "enum",
          params: { allowedValues: schema59.properties.type.enum },
          message: "must be equal to one of the allowed values",
        };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      }
    }
  } else {
    const err13 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err13];
    } else {
      vErrors.push(err13);
    }
    errors++;
  }
  validate42.errors = vErrors;
  return errors === 0;
}
validate42.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

const schema63 = {
  additionalProperties: false,
  properties: {
    metadata: { $ref: "#/$defs/JsonObject" },
    source: { anyOf: [{ type: "string" }, { type: "null" }], default: null, title: "Source" },
    target: { title: "Target", type: "string" },
    transformation: {
      anyOf: [{ $ref: "#/$defs/TransformationDocument" }, { type: "null" }],
      default: null,
    },
  },
  required: ["target"],
  title: "FieldMappingDocument",
  type: "object",
};
const schema64 = {
  anyOf: [
    { $ref: "#/$defs/DirectTransformation" },
    { $ref: "#/$defs/ExpressionTransformation" },
    { $ref: "#/$defs/ConstantTransformation" },
    { $ref: "#/$defs/CustomCodeTransformation" },
  ],
};
const schema65 = {
  additionalProperties: false,
  properties: {
    arguments: { $ref: "#/$defs/EmptyObject" },
    constant: { default: null, title: "Constant", type: "null" },
    expression: { default: null, title: "Expression", type: "null" },
    function: { default: null, title: "Function", type: "null" },
    inputs: { items: { type: "string" }, title: "Inputs", type: "array" },
    kind: { const: "direct", default: "direct", title: "Kind", type: "string" },
    metadata: { $ref: "#/$defs/JsonObject" },
  },
  title: "DirectTransformation",
  type: "object",
};
const schema66 = {
  additionalProperties: false,
  description: "A JSON object that must contain no properties.",
  properties: {},
  title: "EmptyObject",
  type: "object",
};

function validate49(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate49.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    for (const key0 in data) {
      if (!(
        key0 === "arguments" ||
        key0 === "constant" ||
        key0 === "expression" ||
        key0 === "function" ||
        key0 === "inputs" ||
        key0 === "kind" ||
        key0 === "metadata"
      )) {
        const err0 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
    if (data.arguments !== undefined) {
      let data0 = data.arguments;
      if (data0 && typeof data0 == "object" && !Array.isArray(data0)) {
        for (const key1 in data0) {
          const err1 = {
            instancePath: instancePath + "/arguments",
            schemaPath: "#/$defs/EmptyObject/additionalProperties",
            keyword: "additionalProperties",
            params: { additionalProperty: key1 },
            message: "must NOT have additional properties",
          };
          if (vErrors === null) {
            vErrors = [err1];
          } else {
            vErrors.push(err1);
          }
          errors++;
        }
      } else {
        const err2 = {
          instancePath: instancePath + "/arguments",
          schemaPath: "#/$defs/EmptyObject/type",
          keyword: "type",
          params: { type: "object" },
          message: "must be object",
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.constant !== undefined) {
      if (data.constant !== null) {
        const err3 = {
          instancePath: instancePath + "/constant",
          schemaPath: "#/properties/constant/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.expression !== undefined) {
      if (data.expression !== null) {
        const err4 = {
          instancePath: instancePath + "/expression",
          schemaPath: "#/properties/expression/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.function !== undefined) {
      if (data.function !== null) {
        const err5 = {
          instancePath: instancePath + "/function",
          schemaPath: "#/properties/function/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.inputs !== undefined) {
      let data4 = data.inputs;
      if (Array.isArray(data4)) {
        const len0 = data4.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (typeof data4[i0] !== "string") {
            const err6 = {
              instancePath: instancePath + "/inputs/" + i0,
              schemaPath: "#/properties/inputs/items/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string",
            };
            if (vErrors === null) {
              vErrors = [err6];
            } else {
              vErrors.push(err6);
            }
            errors++;
          }
        }
      } else {
        const err7 = {
          instancePath: instancePath + "/inputs",
          schemaPath: "#/properties/inputs/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array",
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
    if (data.kind !== undefined) {
      let data6 = data.kind;
      if (typeof data6 !== "string") {
        const err8 = {
          instancePath: instancePath + "/kind",
          schemaPath: "#/properties/kind/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
      if ("direct" !== data6) {
        const err9 = {
          instancePath: instancePath + "/kind",
          schemaPath: "#/properties/kind/const",
          keyword: "const",
          params: { allowedValue: "direct" },
          message: "must be equal to constant",
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
    if (data.metadata !== undefined) {
      if (
        !validate43(data.metadata, {
          instancePath: instancePath + "/metadata",
          parentData: data,
          parentDataProperty: "metadata",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate43.errors : vErrors.concat(validate43.errors);
        errors = vErrors.length;
      }
    }
  } else {
    const err10 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err10];
    } else {
      vErrors.push(err10);
    }
    errors++;
  }
  validate49.errors = vErrors;
  return errors === 0;
}
validate49.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

const schema67 = {
  additionalProperties: false,
  properties: {
    arguments: { $ref: "#/$defs/EmptyObject" },
    constant: { default: null, title: "Constant", type: "null" },
    expression: { minLength: 1, title: "Expression", type: "string" },
    function: { default: null, title: "Function", type: "null" },
    inputs: { items: { type: "string" }, title: "Inputs", type: "array" },
    kind: { const: "expression", title: "Kind", type: "string" },
    metadata: { $ref: "#/$defs/JsonObject" },
  },
  required: ["kind", "expression"],
  title: "ExpressionTransformation",
  type: "object",
};
const func1 = require("ajv/dist/runtime/ucs2length").default;

function validate52(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate52.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.kind === undefined) {
      const err0 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "kind" },
        message: "must have required property '" + "kind" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.expression === undefined) {
      const err1 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "expression" },
        message: "must have required property '" + "expression" + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(
        key0 === "arguments" ||
        key0 === "constant" ||
        key0 === "expression" ||
        key0 === "function" ||
        key0 === "inputs" ||
        key0 === "kind" ||
        key0 === "metadata"
      )) {
        const err2 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.arguments !== undefined) {
      let data0 = data.arguments;
      if (data0 && typeof data0 == "object" && !Array.isArray(data0)) {
        for (const key1 in data0) {
          const err3 = {
            instancePath: instancePath + "/arguments",
            schemaPath: "#/$defs/EmptyObject/additionalProperties",
            keyword: "additionalProperties",
            params: { additionalProperty: key1 },
            message: "must NOT have additional properties",
          };
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        }
      } else {
        const err4 = {
          instancePath: instancePath + "/arguments",
          schemaPath: "#/$defs/EmptyObject/type",
          keyword: "type",
          params: { type: "object" },
          message: "must be object",
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.constant !== undefined) {
      if (data.constant !== null) {
        const err5 = {
          instancePath: instancePath + "/constant",
          schemaPath: "#/properties/constant/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.expression !== undefined) {
      let data2 = data.expression;
      if (typeof data2 === "string") {
        if (func1(data2) < 1) {
          const err6 = {
            instancePath: instancePath + "/expression",
            schemaPath: "#/properties/expression/minLength",
            keyword: "minLength",
            params: { limit: 1 },
            message: "must NOT have fewer than 1 characters",
          };
          if (vErrors === null) {
            vErrors = [err6];
          } else {
            vErrors.push(err6);
          }
          errors++;
        }
      } else {
        const err7 = {
          instancePath: instancePath + "/expression",
          schemaPath: "#/properties/expression/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
    if (data.function !== undefined) {
      if (data.function !== null) {
        const err8 = {
          instancePath: instancePath + "/function",
          schemaPath: "#/properties/function/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.inputs !== undefined) {
      let data4 = data.inputs;
      if (Array.isArray(data4)) {
        const len0 = data4.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (typeof data4[i0] !== "string") {
            const err9 = {
              instancePath: instancePath + "/inputs/" + i0,
              schemaPath: "#/properties/inputs/items/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string",
            };
            if (vErrors === null) {
              vErrors = [err9];
            } else {
              vErrors.push(err9);
            }
            errors++;
          }
        }
      } else {
        const err10 = {
          instancePath: instancePath + "/inputs",
          schemaPath: "#/properties/inputs/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array",
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.kind !== undefined) {
      let data6 = data.kind;
      if (typeof data6 !== "string") {
        const err11 = {
          instancePath: instancePath + "/kind",
          schemaPath: "#/properties/kind/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
      if ("expression" !== data6) {
        const err12 = {
          instancePath: instancePath + "/kind",
          schemaPath: "#/properties/kind/const",
          keyword: "const",
          params: { allowedValue: "expression" },
          message: "must be equal to constant",
        };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      }
    }
    if (data.metadata !== undefined) {
      if (
        !validate43(data.metadata, {
          instancePath: instancePath + "/metadata",
          parentData: data,
          parentDataProperty: "metadata",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate43.errors : vErrors.concat(validate43.errors);
        errors = vErrors.length;
      }
    }
  } else {
    const err13 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err13];
    } else {
      vErrors.push(err13);
    }
    errors++;
  }
  validate52.errors = vErrors;
  return errors === 0;
}
validate52.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

const schema69 = {
  additionalProperties: false,
  properties: {
    arguments: { $ref: "#/$defs/EmptyObject" },
    constant: { $ref: "#/$defs/JsonValue" },
    expression: { default: null, title: "Expression", type: "null" },
    function: { default: null, title: "Function", type: "null" },
    inputs: { items: { type: "string" }, title: "Inputs", type: "array" },
    kind: { const: "constant", title: "Kind", type: "string" },
    metadata: { $ref: "#/$defs/JsonObject" },
  },
  required: ["kind", "constant"],
  title: "ConstantTransformation",
  type: "object",
};

function validate55(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate55.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.kind === undefined) {
      const err0 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "kind" },
        message: "must have required property '" + "kind" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.constant === undefined) {
      const err1 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "constant" },
        message: "must have required property '" + "constant" + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(
        key0 === "arguments" ||
        key0 === "constant" ||
        key0 === "expression" ||
        key0 === "function" ||
        key0 === "inputs" ||
        key0 === "kind" ||
        key0 === "metadata"
      )) {
        const err2 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.arguments !== undefined) {
      let data0 = data.arguments;
      if (data0 && typeof data0 == "object" && !Array.isArray(data0)) {
        for (const key1 in data0) {
          const err3 = {
            instancePath: instancePath + "/arguments",
            schemaPath: "#/$defs/EmptyObject/additionalProperties",
            keyword: "additionalProperties",
            params: { additionalProperty: key1 },
            message: "must NOT have additional properties",
          };
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        }
      } else {
        const err4 = {
          instancePath: instancePath + "/arguments",
          schemaPath: "#/$defs/EmptyObject/type",
          keyword: "type",
          params: { type: "object" },
          message: "must be object",
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.expression !== undefined) {
      if (data.expression !== null) {
        const err5 = {
          instancePath: instancePath + "/expression",
          schemaPath: "#/properties/expression/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.function !== undefined) {
      if (data.function !== null) {
        const err6 = {
          instancePath: instancePath + "/function",
          schemaPath: "#/properties/function/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.inputs !== undefined) {
      let data4 = data.inputs;
      if (Array.isArray(data4)) {
        const len0 = data4.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (typeof data4[i0] !== "string") {
            const err7 = {
              instancePath: instancePath + "/inputs/" + i0,
              schemaPath: "#/properties/inputs/items/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string",
            };
            if (vErrors === null) {
              vErrors = [err7];
            } else {
              vErrors.push(err7);
            }
            errors++;
          }
        }
      } else {
        const err8 = {
          instancePath: instancePath + "/inputs",
          schemaPath: "#/properties/inputs/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array",
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.kind !== undefined) {
      let data6 = data.kind;
      if (typeof data6 !== "string") {
        const err9 = {
          instancePath: instancePath + "/kind",
          schemaPath: "#/properties/kind/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
      if ("constant" !== data6) {
        const err10 = {
          instancePath: instancePath + "/kind",
          schemaPath: "#/properties/kind/const",
          keyword: "const",
          params: { allowedValue: "constant" },
          message: "must be equal to constant",
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.metadata !== undefined) {
      if (
        !validate43(data.metadata, {
          instancePath: instancePath + "/metadata",
          parentData: data,
          parentDataProperty: "metadata",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate43.errors : vErrors.concat(validate43.errors);
        errors = vErrors.length;
      }
    }
  } else {
    const err11 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err11];
    } else {
      vErrors.push(err11);
    }
    errors++;
  }
  validate55.errors = vErrors;
  return errors === 0;
}
validate55.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

const schema72 = {
  additionalProperties: false,
  properties: {
    arguments: { $ref: "#/$defs/JsonObject" },
    constant: { default: null, title: "Constant", type: "null" },
    expression: { default: null, title: "Expression", type: "null" },
    function: {
      pattern: "^[A-Za-z_][A-Za-z0-9_]*(\\.[A-Za-z_][A-Za-z0-9_]*)*$",
      title: "Function",
      type: "string",
    },
    inputs: { items: { type: "string" }, title: "Inputs", type: "array" },
    kind: { const: "custom_code", title: "Kind", type: "string" },
    metadata: { $ref: "#/$defs/JsonObject" },
  },
  required: ["kind", "function"],
  title: "CustomCodeTransformation",
  type: "object",
};
const pattern7 = new RegExp("^[A-Za-z_][A-Za-z0-9_]*(\\.[A-Za-z_][A-Za-z0-9_]*)*$", "u");

function validate58(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate58.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.kind === undefined) {
      const err0 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "kind" },
        message: "must have required property '" + "kind" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.function === undefined) {
      const err1 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "function" },
        message: "must have required property '" + "function" + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(
        key0 === "arguments" ||
        key0 === "constant" ||
        key0 === "expression" ||
        key0 === "function" ||
        key0 === "inputs" ||
        key0 === "kind" ||
        key0 === "metadata"
      )) {
        const err2 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.arguments !== undefined) {
      if (
        !validate43(data.arguments, {
          instancePath: instancePath + "/arguments",
          parentData: data,
          parentDataProperty: "arguments",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate43.errors : vErrors.concat(validate43.errors);
        errors = vErrors.length;
      }
    }
    if (data.constant !== undefined) {
      if (data.constant !== null) {
        const err3 = {
          instancePath: instancePath + "/constant",
          schemaPath: "#/properties/constant/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.expression !== undefined) {
      if (data.expression !== null) {
        const err4 = {
          instancePath: instancePath + "/expression",
          schemaPath: "#/properties/expression/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.function !== undefined) {
      let data3 = data.function;
      if (typeof data3 === "string") {
        if (!pattern7.test(data3)) {
          const err5 = {
            instancePath: instancePath + "/function",
            schemaPath: "#/properties/function/pattern",
            keyword: "pattern",
            params: { pattern: "^[A-Za-z_][A-Za-z0-9_]*(\\.[A-Za-z_][A-Za-z0-9_]*)*$" },
            message:
              'must match pattern "' + "^[A-Za-z_][A-Za-z0-9_]*(\\.[A-Za-z_][A-Za-z0-9_]*)*$" + '"',
          };
          if (vErrors === null) {
            vErrors = [err5];
          } else {
            vErrors.push(err5);
          }
          errors++;
        }
      } else {
        const err6 = {
          instancePath: instancePath + "/function",
          schemaPath: "#/properties/function/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.inputs !== undefined) {
      let data4 = data.inputs;
      if (Array.isArray(data4)) {
        const len0 = data4.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (typeof data4[i0] !== "string") {
            const err7 = {
              instancePath: instancePath + "/inputs/" + i0,
              schemaPath: "#/properties/inputs/items/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string",
            };
            if (vErrors === null) {
              vErrors = [err7];
            } else {
              vErrors.push(err7);
            }
            errors++;
          }
        }
      } else {
        const err8 = {
          instancePath: instancePath + "/inputs",
          schemaPath: "#/properties/inputs/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array",
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.kind !== undefined) {
      let data6 = data.kind;
      if (typeof data6 !== "string") {
        const err9 = {
          instancePath: instancePath + "/kind",
          schemaPath: "#/properties/kind/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
      if ("custom_code" !== data6) {
        const err10 = {
          instancePath: instancePath + "/kind",
          schemaPath: "#/properties/kind/const",
          keyword: "const",
          params: { allowedValue: "custom_code" },
          message: "must be equal to constant",
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.metadata !== undefined) {
      if (
        !validate43(data.metadata, {
          instancePath: instancePath + "/metadata",
          parentData: data,
          parentDataProperty: "metadata",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate43.errors : vErrors.concat(validate43.errors);
        errors = vErrors.length;
      }
    }
  } else {
    const err11 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err11];
    } else {
      vErrors.push(err11);
    }
    errors++;
  }
  validate58.errors = vErrors;
  return errors === 0;
}
validate58.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

function validate48(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate48.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  const _errs0 = errors;
  let valid0 = false;
  const _errs1 = errors;
  if (
    !validate49(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate49.errors : vErrors.concat(validate49.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = true;
  }
  const _errs2 = errors;
  if (
    !validate52(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate52.errors : vErrors.concat(validate52.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = true;
    }
  }
  const _errs3 = errors;
  if (
    !validate55(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate55.errors : vErrors.concat(validate55.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs3 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = true;
    }
  }
  const _errs4 = errors;
  if (
    !validate58(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate58.errors : vErrors.concat(validate58.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs4 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = true;
    }
  }
  if (!valid0) {
    const err0 = {
      instancePath,
      schemaPath: "#/anyOf",
      keyword: "anyOf",
      params: {},
      message: "must match a schema in anyOf",
    };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate48.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate48.evaluated = { dynamicProps: true, dynamicItems: false };

function validate46(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate46.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.target === undefined) {
      const err0 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "target" },
        message: "must have required property '" + "target" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(
        key0 === "metadata" ||
        key0 === "source" ||
        key0 === "target" ||
        key0 === "transformation"
      )) {
        const err1 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
    if (data.metadata !== undefined) {
      if (
        !validate43(data.metadata, {
          instancePath: instancePath + "/metadata",
          parentData: data,
          parentDataProperty: "metadata",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate43.errors : vErrors.concat(validate43.errors);
        errors = vErrors.length;
      }
    }
    if (data.source !== undefined) {
      let data1 = data.source;
      const _errs4 = errors;
      let valid1 = false;
      const _errs5 = errors;
      if (typeof data1 !== "string") {
        const err2 = {
          instancePath: instancePath + "/source",
          schemaPath: "#/properties/source/anyOf/0/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
      var _valid0 = _errs5 === errors;
      valid1 = valid1 || _valid0;
      const _errs7 = errors;
      if (data1 !== null) {
        const err3 = {
          instancePath: instancePath + "/source",
          schemaPath: "#/properties/source/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
      var _valid0 = _errs7 === errors;
      valid1 = valid1 || _valid0;
      if (!valid1) {
        const err4 = {
          instancePath: instancePath + "/source",
          schemaPath: "#/properties/source/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      } else {
        errors = _errs4;
        if (vErrors !== null) {
          if (_errs4) {
            vErrors.length = _errs4;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.target !== undefined) {
      if (typeof data.target !== "string") {
        const err5 = {
          instancePath: instancePath + "/target",
          schemaPath: "#/properties/target/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.transformation !== undefined) {
      let data3 = data.transformation;
      const _errs12 = errors;
      let valid2 = false;
      const _errs13 = errors;
      if (
        !validate48(data3, {
          instancePath: instancePath + "/transformation",
          parentData: data,
          parentDataProperty: "transformation",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate48.errors : vErrors.concat(validate48.errors);
        errors = vErrors.length;
      }
      var _valid1 = _errs13 === errors;
      valid2 = valid2 || _valid1;
      const _errs14 = errors;
      if (data3 !== null) {
        const err6 = {
          instancePath: instancePath + "/transformation",
          schemaPath: "#/properties/transformation/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
      var _valid1 = _errs14 === errors;
      valid2 = valid2 || _valid1;
      if (!valid2) {
        const err7 = {
          instancePath: instancePath + "/transformation",
          schemaPath: "#/properties/transformation/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      } else {
        errors = _errs12;
        if (vErrors !== null) {
          if (_errs12) {
            vErrors.length = _errs12;
          } else {
            vErrors = null;
          }
        }
      }
    }
  } else {
    const err8 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err8];
    } else {
      vErrors.push(err8);
    }
    errors++;
  }
  validate46.errors = vErrors;
  return errors === 0;
}
validate46.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

function validate41(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate41.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.from === undefined) {
      const err0 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "from" },
        message: "must have required property '" + "from" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.to === undefined) {
      const err1 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "to" },
        message: "must have required property '" + "to" + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(
        key0 === "from" ||
        key0 === "join" ||
        key0 === "mappings" ||
        key0 === "metadata" ||
        key0 === "to"
      )) {
        const err2 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.from !== undefined) {
      if (typeof data.from !== "string") {
        const err3 = {
          instancePath: instancePath + "/from",
          schemaPath: "#/properties/from/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.join !== undefined) {
      let data1 = data.join;
      const _errs5 = errors;
      let valid1 = false;
      const _errs6 = errors;
      if (
        !validate42(data1, {
          instancePath: instancePath + "/join",
          parentData: data,
          parentDataProperty: "join",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate42.errors : vErrors.concat(validate42.errors);
        errors = vErrors.length;
      }
      var _valid0 = _errs6 === errors;
      valid1 = valid1 || _valid0;
      const _errs7 = errors;
      if (data1 !== null) {
        const err4 = {
          instancePath: instancePath + "/join",
          schemaPath: "#/properties/join/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
      var _valid0 = _errs7 === errors;
      valid1 = valid1 || _valid0;
      if (!valid1) {
        const err5 = {
          instancePath: instancePath + "/join",
          schemaPath: "#/properties/join/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      } else {
        errors = _errs5;
        if (vErrors !== null) {
          if (_errs5) {
            vErrors.length = _errs5;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.mappings !== undefined) {
      let data2 = data.mappings;
      if (Array.isArray(data2)) {
        const len0 = data2.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (
            !validate46(data2[i0], {
              instancePath: instancePath + "/mappings/" + i0,
              parentData: data2,
              parentDataProperty: i0,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err6 = {
          instancePath: instancePath + "/mappings",
          schemaPath: "#/properties/mappings/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array",
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.metadata !== undefined) {
      if (
        !validate43(data.metadata, {
          instancePath: instancePath + "/metadata",
          parentData: data,
          parentDataProperty: "metadata",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate43.errors : vErrors.concat(validate43.errors);
        errors = vErrors.length;
      }
    }
    if (data.to !== undefined) {
      if (typeof data.to !== "string") {
        const err7 = {
          instancePath: instancePath + "/to",
          schemaPath: "#/properties/to/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
  } else {
    const err8 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err8];
    } else {
      vErrors.push(err8);
    }
    errors++;
  }
  validate41.errors = vErrors;
  return errors === 0;
}
validate41.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

const schema73 = {
  anyOf: [
    { $ref: "#/$defs/SourceNodeDocument" },
    { $ref: "#/$defs/TransformNodeDocument" },
    { $ref: "#/$defs/TargetNodeDocument" },
    { $ref: "#/$defs/ExtensionNodeDocument" },
  ],
};
const schema74 = {
  additionalProperties: false,
  not: { required: ["config", "params"] },
  properties: {
    config: { $ref: "#/$defs/SourceNodeConfigDocument" },
    cursor: {
      anyOf: [{ $ref: "#/$defs/CursorStrategyDocument" }, { type: "null" }],
      default: null,
    },
    fields: { items: { $ref: "#/$defs/NodeFieldDocument" }, title: "Fields", type: "array" },
    id: { title: "Id", type: "string" },
    name: { title: "Name", type: "string" },
    params: {
      anyOf: [{ $ref: "#/$defs/SourceNodeConfigDocument" }, { type: "null" }],
      default: null,
      deprecated: true,
      "x-dander-canonical-name": "config",
    },
    trigger: { anyOf: [{ $ref: "#/$defs/TriggerDocument" }, { type: "null" }], default: null },
    type: { const: "source", title: "Type", type: "string" },
    visual: { anyOf: [{ $ref: "#/$defs/NodeVisualDocument" }, { type: "null" }], default: null },
  },
  required: ["id", "type", "name"],
  title: "SourceNodeDocument",
  type: "object",
};
const func2 = Object.prototype.hasOwnProperty;
const schema75 = {
  additionalProperties: { $ref: "#/$defs/JsonValue" },
  properties: {
    connector: { anyOf: [{ type: "string" }, { type: "null" }], default: null, title: "Connector" },
    endpoint: { anyOf: [{ type: "string" }, { type: "null" }], default: null, title: "Endpoint" },
    request: { anyOf: [{ $ref: "#/$defs/RequestSpecDocument" }, { type: "null" }], default: null },
  },
  title: "SourceNodeConfigDocument",
  type: "object",
};
const schema77 = {
  additionalProperties: false,
  properties: {
    body: {
      anyOf: [{ $ref: "#/$defs/JsonObject" }, { type: "string" }, { type: "null" }],
      default: null,
      title: "Body",
    },
    headers: { additionalProperties: { type: "string" }, title: "Headers", type: "object" },
    method: { $ref: "#/$defs/HttpMethod", default: "GET" },
    query_params: {
      additionalProperties: { type: "string" },
      title: "Query Params",
      type: "object",
    },
  },
  title: "RequestSpecDocument",
  type: "object",
};
const schema78 = {
  description:
    "The closed set of HTTP methods a `RequestSpec` may declare.\n\nA `StrEnum` (matching the `TransformationKind`/`JoinType` convention in `graph.py`) so callers\nget a named, importable type that still serializes to/from its plain string value stably in\nYAML and JSON. An out-of-set value fails validation with a clear error at the Pydantic\nboundary. `HEAD`/`OPTIONS` are intentionally omitted (no source currently needs them); extend\nby adding a member later without touching callers.\n\nAttributes:\n    GET: Retrieve a resource. The default method (a simple GET needs no explicit spec).\n    POST: Create a resource / submit a query body.\n    PUT: Replace a resource.\n    PATCH: Partially update a resource.\n    DELETE: Remove a resource.",
  enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  title: "HttpMethod",
  type: "string",
};

function validate69(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate69.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    for (const key0 in data) {
      if (!(
        key0 === "body" ||
        key0 === "headers" ||
        key0 === "method" ||
        key0 === "query_params"
      )) {
        const err0 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
    if (data.body !== undefined) {
      let data0 = data.body;
      const _errs3 = errors;
      let valid1 = false;
      const _errs4 = errors;
      if (
        !validate43(data0, {
          instancePath: instancePath + "/body",
          parentData: data,
          parentDataProperty: "body",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate43.errors : vErrors.concat(validate43.errors);
        errors = vErrors.length;
      }
      var _valid0 = _errs4 === errors;
      valid1 = valid1 || _valid0;
      const _errs5 = errors;
      if (typeof data0 !== "string") {
        const err1 = {
          instancePath: instancePath + "/body",
          schemaPath: "#/properties/body/anyOf/1/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
      var _valid0 = _errs5 === errors;
      valid1 = valid1 || _valid0;
      const _errs7 = errors;
      if (data0 !== null) {
        const err2 = {
          instancePath: instancePath + "/body",
          schemaPath: "#/properties/body/anyOf/2/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
      var _valid0 = _errs7 === errors;
      valid1 = valid1 || _valid0;
      if (!valid1) {
        const err3 = {
          instancePath: instancePath + "/body",
          schemaPath: "#/properties/body/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      } else {
        errors = _errs3;
        if (vErrors !== null) {
          if (_errs3) {
            vErrors.length = _errs3;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.headers !== undefined) {
      let data1 = data.headers;
      if (data1 && typeof data1 == "object" && !Array.isArray(data1)) {
        for (const key1 in data1) {
          if (typeof data1[key1] !== "string") {
            const err4 = {
              instancePath:
                instancePath + "/headers/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"),
              schemaPath: "#/properties/headers/additionalProperties/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string",
            };
            if (vErrors === null) {
              vErrors = [err4];
            } else {
              vErrors.push(err4);
            }
            errors++;
          }
        }
      } else {
        const err5 = {
          instancePath: instancePath + "/headers",
          schemaPath: "#/properties/headers/type",
          keyword: "type",
          params: { type: "object" },
          message: "must be object",
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.method !== undefined) {
      let data3 = data.method;
      if (typeof data3 !== "string") {
        const err6 = {
          instancePath: instancePath + "/method",
          schemaPath: "#/$defs/HttpMethod/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
      if (!(
        data3 === "GET" ||
        data3 === "POST" ||
        data3 === "PUT" ||
        data3 === "PATCH" ||
        data3 === "DELETE"
      )) {
        const err7 = {
          instancePath: instancePath + "/method",
          schemaPath: "#/$defs/HttpMethod/enum",
          keyword: "enum",
          params: { allowedValues: schema78.enum },
          message: "must be equal to one of the allowed values",
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
    if (data.query_params !== undefined) {
      let data4 = data.query_params;
      if (data4 && typeof data4 == "object" && !Array.isArray(data4)) {
        for (const key2 in data4) {
          if (typeof data4[key2] !== "string") {
            const err8 = {
              instancePath:
                instancePath + "/query_params/" + key2.replace(/~/g, "~0").replace(/\//g, "~1"),
              schemaPath: "#/properties/query_params/additionalProperties/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string",
            };
            if (vErrors === null) {
              vErrors = [err8];
            } else {
              vErrors.push(err8);
            }
            errors++;
          }
        }
      } else {
        const err9 = {
          instancePath: instancePath + "/query_params",
          schemaPath: "#/properties/query_params/type",
          keyword: "type",
          params: { type: "object" },
          message: "must be object",
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
  } else {
    const err10 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err10];
    } else {
      vErrors.push(err10);
    }
    errors++;
  }
  validate69.errors = vErrors;
  return errors === 0;
}
validate69.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

function validate68(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate68.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.connector !== undefined) {
      let data1 = data.connector;
      const _errs4 = errors;
      let valid3 = false;
      const _errs5 = errors;
      if (typeof data1 !== "string") {
        const err0 = {
          instancePath: instancePath + "/connector",
          schemaPath: "#/properties/connector/anyOf/0/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
      var _valid0 = _errs5 === errors;
      valid3 = valid3 || _valid0;
      const _errs7 = errors;
      if (data1 !== null) {
        const err1 = {
          instancePath: instancePath + "/connector",
          schemaPath: "#/properties/connector/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
      var _valid0 = _errs7 === errors;
      valid3 = valid3 || _valid0;
      if (!valid3) {
        const err2 = {
          instancePath: instancePath + "/connector",
          schemaPath: "#/properties/connector/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      } else {
        errors = _errs4;
        if (vErrors !== null) {
          if (_errs4) {
            vErrors.length = _errs4;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.endpoint !== undefined) {
      let data2 = data.endpoint;
      const _errs10 = errors;
      let valid4 = false;
      const _errs11 = errors;
      if (typeof data2 !== "string") {
        const err3 = {
          instancePath: instancePath + "/endpoint",
          schemaPath: "#/properties/endpoint/anyOf/0/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
      var _valid1 = _errs11 === errors;
      valid4 = valid4 || _valid1;
      const _errs13 = errors;
      if (data2 !== null) {
        const err4 = {
          instancePath: instancePath + "/endpoint",
          schemaPath: "#/properties/endpoint/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
      var _valid1 = _errs13 === errors;
      valid4 = valid4 || _valid1;
      if (!valid4) {
        const err5 = {
          instancePath: instancePath + "/endpoint",
          schemaPath: "#/properties/endpoint/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      } else {
        errors = _errs10;
        if (vErrors !== null) {
          if (_errs10) {
            vErrors.length = _errs10;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.request !== undefined) {
      let data3 = data.request;
      const _errs16 = errors;
      let valid5 = false;
      const _errs17 = errors;
      if (
        !validate69(data3, {
          instancePath: instancePath + "/request",
          parentData: data,
          parentDataProperty: "request",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate69.errors : vErrors.concat(validate69.errors);
        errors = vErrors.length;
      }
      var _valid2 = _errs17 === errors;
      valid5 = valid5 || _valid2;
      const _errs18 = errors;
      if (data3 !== null) {
        const err6 = {
          instancePath: instancePath + "/request",
          schemaPath: "#/properties/request/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
      var _valid2 = _errs18 === errors;
      valid5 = valid5 || _valid2;
      if (!valid5) {
        const err7 = {
          instancePath: instancePath + "/request",
          schemaPath: "#/properties/request/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      } else {
        errors = _errs16;
        if (vErrors !== null) {
          if (_errs16) {
            vErrors.length = _errs16;
          } else {
            vErrors = null;
          }
        }
      }
    }
  } else {
    const err8 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err8];
    } else {
      vErrors.push(err8);
    }
    errors++;
  }
  validate68.errors = vErrors;
  return errors === 0;
}
validate68.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

const schema79 = {
  additionalProperties: false,
  properties: {
    field: { minLength: 1, title: "Field", type: "string" },
    kind: { enum: ["timestamp", "sequence", "opaque_token"], title: "Kind", type: "string" },
    metadata: { $ref: "#/$defs/JsonObject" },
    params: { $ref: "#/$defs/JsonObject" },
  },
  required: ["field", "kind"],
  title: "CursorStrategyDocument",
  type: "object",
};

function validate73(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate73.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.field === undefined) {
      const err0 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "field" },
        message: "must have required property '" + "field" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.kind === undefined) {
      const err1 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "kind" },
        message: "must have required property '" + "kind" + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(key0 === "field" || key0 === "kind" || key0 === "metadata" || key0 === "params")) {
        const err2 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.field !== undefined) {
      let data0 = data.field;
      if (typeof data0 === "string") {
        if (func1(data0) < 1) {
          const err3 = {
            instancePath: instancePath + "/field",
            schemaPath: "#/properties/field/minLength",
            keyword: "minLength",
            params: { limit: 1 },
            message: "must NOT have fewer than 1 characters",
          };
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        }
      } else {
        const err4 = {
          instancePath: instancePath + "/field",
          schemaPath: "#/properties/field/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.kind !== undefined) {
      let data1 = data.kind;
      if (typeof data1 !== "string") {
        const err5 = {
          instancePath: instancePath + "/kind",
          schemaPath: "#/properties/kind/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
      if (!(data1 === "timestamp" || data1 === "sequence" || data1 === "opaque_token")) {
        const err6 = {
          instancePath: instancePath + "/kind",
          schemaPath: "#/properties/kind/enum",
          keyword: "enum",
          params: { allowedValues: schema79.properties.kind.enum },
          message: "must be equal to one of the allowed values",
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.metadata !== undefined) {
      if (
        !validate43(data.metadata, {
          instancePath: instancePath + "/metadata",
          parentData: data,
          parentDataProperty: "metadata",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate43.errors : vErrors.concat(validate43.errors);
        errors = vErrors.length;
      }
    }
    if (data.params !== undefined) {
      if (
        !validate43(data.params, {
          instancePath: instancePath + "/params",
          parentData: data,
          parentDataProperty: "params",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate43.errors : vErrors.concat(validate43.errors);
        errors = vErrors.length;
      }
    }
  } else {
    const err7 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err7];
    } else {
      vErrors.push(err7);
    }
    errors++;
  }
  validate73.errors = vErrors;
  return errors === 0;
}
validate73.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

const schema80 = {
  additionalProperties: false,
  properties: {
    cast_to: { anyOf: [{ type: "string" }, { type: "null" }], default: null, title: "Cast To" },
    description: {
      anyOf: [{ type: "string" }, { type: "null" }],
      default: null,
      title: "Description",
    },
    extensions: {
      items: { $ref: "#/$defs/ProviderExtension" },
      title: "Extensions",
      type: "array",
    },
    metadata: { $ref: "#/$defs/JsonObject" },
    name: { title: "Name", type: "string" },
    nullable: { default: true, title: "Nullable", type: "boolean" },
    tests: { items: { $ref: "#/$defs/FieldTestDocument" }, title: "Tests", type: "array" },
    type: { title: "Type", type: "string" },
  },
  required: ["name", "type"],
  title: "NodeFieldDocument",
  type: "object",
};
const schema81 = {
  additionalProperties: false,
  description: "One deterministic provider-specific schema annotation, never a credential.",
  properties: {
    name: { title: "Name", type: "string" },
    provider: { title: "Provider", type: "string" },
    value: {
      anyOf: [{ type: "string" }, { type: "integer" }, { type: "number" }, { type: "boolean" }],
      title: "Value",
    },
  },
  required: ["provider", "name", "value"],
  title: "ProviderExtension",
  type: "object",
};
const schema82 = {
  anyOf: [
    { $ref: "#/$defs/NotNullFieldTest" },
    { $ref: "#/$defs/UniqueFieldTest" },
    { $ref: "#/$defs/AcceptedValuesFieldTest" },
    { $ref: "#/$defs/RelationshipsFieldTest" },
  ],
};
const schema83 = {
  additionalProperties: false,
  properties: {
    field: { default: null, title: "Field", type: "null" },
    kind: { const: "not_null", title: "Kind", type: "string" },
    metadata: { $ref: "#/$defs/JsonObject" },
    to: { default: null, title: "To", type: "null" },
    values: { items: { $ref: "#/$defs/JsonValue" }, maxItems: 0, title: "Values", type: "array" },
  },
  required: ["kind"],
  title: "NotNullFieldTest",
  type: "object",
};

function validate80(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate80.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.kind === undefined) {
      const err0 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "kind" },
        message: "must have required property '" + "kind" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(
        key0 === "field" ||
        key0 === "kind" ||
        key0 === "metadata" ||
        key0 === "to" ||
        key0 === "values"
      )) {
        const err1 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
    if (data.field !== undefined) {
      if (data.field !== null) {
        const err2 = {
          instancePath: instancePath + "/field",
          schemaPath: "#/properties/field/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.kind !== undefined) {
      let data1 = data.kind;
      if (typeof data1 !== "string") {
        const err3 = {
          instancePath: instancePath + "/kind",
          schemaPath: "#/properties/kind/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
      if ("not_null" !== data1) {
        const err4 = {
          instancePath: instancePath + "/kind",
          schemaPath: "#/properties/kind/const",
          keyword: "const",
          params: { allowedValue: "not_null" },
          message: "must be equal to constant",
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.metadata !== undefined) {
      if (
        !validate43(data.metadata, {
          instancePath: instancePath + "/metadata",
          parentData: data,
          parentDataProperty: "metadata",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate43.errors : vErrors.concat(validate43.errors);
        errors = vErrors.length;
      }
    }
    if (data.to !== undefined) {
      if (data.to !== null) {
        const err5 = {
          instancePath: instancePath + "/to",
          schemaPath: "#/properties/to/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.values !== undefined) {
      let data4 = data.values;
      if (Array.isArray(data4)) {
        if (data4.length > 0) {
          const err6 = {
            instancePath: instancePath + "/values",
            schemaPath: "#/properties/values/maxItems",
            keyword: "maxItems",
            params: { limit: 0 },
            message: "must NOT have more than 0 items",
          };
          if (vErrors === null) {
            vErrors = [err6];
          } else {
            vErrors.push(err6);
          }
          errors++;
        }
      } else {
        const err7 = {
          instancePath: instancePath + "/values",
          schemaPath: "#/properties/values/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array",
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
  } else {
    const err8 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err8];
    } else {
      vErrors.push(err8);
    }
    errors++;
  }
  validate80.errors = vErrors;
  return errors === 0;
}
validate80.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

const schema85 = {
  additionalProperties: false,
  properties: {
    field: { default: null, title: "Field", type: "null" },
    kind: { const: "unique", title: "Kind", type: "string" },
    metadata: { $ref: "#/$defs/JsonObject" },
    to: { default: null, title: "To", type: "null" },
    values: { items: { $ref: "#/$defs/JsonValue" }, maxItems: 0, title: "Values", type: "array" },
  },
  required: ["kind"],
  title: "UniqueFieldTest",
  type: "object",
};

function validate83(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate83.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.kind === undefined) {
      const err0 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "kind" },
        message: "must have required property '" + "kind" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(
        key0 === "field" ||
        key0 === "kind" ||
        key0 === "metadata" ||
        key0 === "to" ||
        key0 === "values"
      )) {
        const err1 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
    if (data.field !== undefined) {
      if (data.field !== null) {
        const err2 = {
          instancePath: instancePath + "/field",
          schemaPath: "#/properties/field/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.kind !== undefined) {
      let data1 = data.kind;
      if (typeof data1 !== "string") {
        const err3 = {
          instancePath: instancePath + "/kind",
          schemaPath: "#/properties/kind/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
      if ("unique" !== data1) {
        const err4 = {
          instancePath: instancePath + "/kind",
          schemaPath: "#/properties/kind/const",
          keyword: "const",
          params: { allowedValue: "unique" },
          message: "must be equal to constant",
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.metadata !== undefined) {
      if (
        !validate43(data.metadata, {
          instancePath: instancePath + "/metadata",
          parentData: data,
          parentDataProperty: "metadata",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate43.errors : vErrors.concat(validate43.errors);
        errors = vErrors.length;
      }
    }
    if (data.to !== undefined) {
      if (data.to !== null) {
        const err5 = {
          instancePath: instancePath + "/to",
          schemaPath: "#/properties/to/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.values !== undefined) {
      let data4 = data.values;
      if (Array.isArray(data4)) {
        if (data4.length > 0) {
          const err6 = {
            instancePath: instancePath + "/values",
            schemaPath: "#/properties/values/maxItems",
            keyword: "maxItems",
            params: { limit: 0 },
            message: "must NOT have more than 0 items",
          };
          if (vErrors === null) {
            vErrors = [err6];
          } else {
            vErrors.push(err6);
          }
          errors++;
        }
      } else {
        const err7 = {
          instancePath: instancePath + "/values",
          schemaPath: "#/properties/values/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array",
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
  } else {
    const err8 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err8];
    } else {
      vErrors.push(err8);
    }
    errors++;
  }
  validate83.errors = vErrors;
  return errors === 0;
}
validate83.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

const schema87 = {
  additionalProperties: false,
  properties: {
    field: { default: null, title: "Field", type: "null" },
    kind: { const: "accepted_values", title: "Kind", type: "string" },
    metadata: { $ref: "#/$defs/JsonObject" },
    to: { default: null, title: "To", type: "null" },
    values: { items: { $ref: "#/$defs/JsonValue" }, minItems: 1, title: "Values", type: "array" },
  },
  required: ["kind", "values"],
  title: "AcceptedValuesFieldTest",
  type: "object",
};

function validate86(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate86.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.kind === undefined) {
      const err0 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "kind" },
        message: "must have required property '" + "kind" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.values === undefined) {
      const err1 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "values" },
        message: "must have required property '" + "values" + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(
        key0 === "field" ||
        key0 === "kind" ||
        key0 === "metadata" ||
        key0 === "to" ||
        key0 === "values"
      )) {
        const err2 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.field !== undefined) {
      if (data.field !== null) {
        const err3 = {
          instancePath: instancePath + "/field",
          schemaPath: "#/properties/field/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.kind !== undefined) {
      let data1 = data.kind;
      if (typeof data1 !== "string") {
        const err4 = {
          instancePath: instancePath + "/kind",
          schemaPath: "#/properties/kind/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
      if ("accepted_values" !== data1) {
        const err5 = {
          instancePath: instancePath + "/kind",
          schemaPath: "#/properties/kind/const",
          keyword: "const",
          params: { allowedValue: "accepted_values" },
          message: "must be equal to constant",
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.metadata !== undefined) {
      if (
        !validate43(data.metadata, {
          instancePath: instancePath + "/metadata",
          parentData: data,
          parentDataProperty: "metadata",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate43.errors : vErrors.concat(validate43.errors);
        errors = vErrors.length;
      }
    }
    if (data.to !== undefined) {
      if (data.to !== null) {
        const err6 = {
          instancePath: instancePath + "/to",
          schemaPath: "#/properties/to/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.values !== undefined) {
      let data4 = data.values;
      if (Array.isArray(data4)) {
        if (data4.length < 1) {
          const err7 = {
            instancePath: instancePath + "/values",
            schemaPath: "#/properties/values/minItems",
            keyword: "minItems",
            params: { limit: 1 },
            message: "must NOT have fewer than 1 items",
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      } else {
        const err8 = {
          instancePath: instancePath + "/values",
          schemaPath: "#/properties/values/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array",
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
  } else {
    const err9 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err9];
    } else {
      vErrors.push(err9);
    }
    errors++;
  }
  validate86.errors = vErrors;
  return errors === 0;
}
validate86.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

const schema89 = {
  additionalProperties: false,
  properties: {
    field: { minLength: 1, title: "Field", type: "string" },
    kind: { const: "relationships", title: "Kind", type: "string" },
    metadata: { $ref: "#/$defs/JsonObject" },
    to: { minLength: 1, title: "To", type: "string" },
    values: { items: { $ref: "#/$defs/JsonValue" }, maxItems: 0, title: "Values", type: "array" },
  },
  required: ["kind", "to", "field"],
  title: "RelationshipsFieldTest",
  type: "object",
};

function validate89(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate89.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.kind === undefined) {
      const err0 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "kind" },
        message: "must have required property '" + "kind" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.to === undefined) {
      const err1 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "to" },
        message: "must have required property '" + "to" + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.field === undefined) {
      const err2 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "field" },
        message: "must have required property '" + "field" + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(
        key0 === "field" ||
        key0 === "kind" ||
        key0 === "metadata" ||
        key0 === "to" ||
        key0 === "values"
      )) {
        const err3 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.field !== undefined) {
      let data0 = data.field;
      if (typeof data0 === "string") {
        if (func1(data0) < 1) {
          const err4 = {
            instancePath: instancePath + "/field",
            schemaPath: "#/properties/field/minLength",
            keyword: "minLength",
            params: { limit: 1 },
            message: "must NOT have fewer than 1 characters",
          };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
      } else {
        const err5 = {
          instancePath: instancePath + "/field",
          schemaPath: "#/properties/field/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.kind !== undefined) {
      let data1 = data.kind;
      if (typeof data1 !== "string") {
        const err6 = {
          instancePath: instancePath + "/kind",
          schemaPath: "#/properties/kind/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
      if ("relationships" !== data1) {
        const err7 = {
          instancePath: instancePath + "/kind",
          schemaPath: "#/properties/kind/const",
          keyword: "const",
          params: { allowedValue: "relationships" },
          message: "must be equal to constant",
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
    if (data.metadata !== undefined) {
      if (
        !validate43(data.metadata, {
          instancePath: instancePath + "/metadata",
          parentData: data,
          parentDataProperty: "metadata",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate43.errors : vErrors.concat(validate43.errors);
        errors = vErrors.length;
      }
    }
    if (data.to !== undefined) {
      let data3 = data.to;
      if (typeof data3 === "string") {
        if (func1(data3) < 1) {
          const err8 = {
            instancePath: instancePath + "/to",
            schemaPath: "#/properties/to/minLength",
            keyword: "minLength",
            params: { limit: 1 },
            message: "must NOT have fewer than 1 characters",
          };
          if (vErrors === null) {
            vErrors = [err8];
          } else {
            vErrors.push(err8);
          }
          errors++;
        }
      } else {
        const err9 = {
          instancePath: instancePath + "/to",
          schemaPath: "#/properties/to/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
    if (data.values !== undefined) {
      let data4 = data.values;
      if (Array.isArray(data4)) {
        if (data4.length > 0) {
          const err10 = {
            instancePath: instancePath + "/values",
            schemaPath: "#/properties/values/maxItems",
            keyword: "maxItems",
            params: { limit: 0 },
            message: "must NOT have more than 0 items",
          };
          if (vErrors === null) {
            vErrors = [err10];
          } else {
            vErrors.push(err10);
          }
          errors++;
        }
      } else {
        const err11 = {
          instancePath: instancePath + "/values",
          schemaPath: "#/properties/values/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array",
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
  } else {
    const err12 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err12];
    } else {
      vErrors.push(err12);
    }
    errors++;
  }
  validate89.errors = vErrors;
  return errors === 0;
}
validate89.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

function validate79(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate79.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  const _errs0 = errors;
  let valid0 = false;
  const _errs1 = errors;
  if (
    !validate80(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate80.errors : vErrors.concat(validate80.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = true;
  }
  const _errs2 = errors;
  if (
    !validate83(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate83.errors : vErrors.concat(validate83.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = true;
    }
  }
  const _errs3 = errors;
  if (
    !validate86(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate86.errors : vErrors.concat(validate86.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs3 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = true;
    }
  }
  const _errs4 = errors;
  if (
    !validate89(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate89.errors : vErrors.concat(validate89.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs4 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = true;
    }
  }
  if (!valid0) {
    const err0 = {
      instancePath,
      schemaPath: "#/anyOf",
      keyword: "anyOf",
      params: {},
      message: "must match a schema in anyOf",
    };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate79.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate79.evaluated = { dynamicProps: true, dynamicItems: false };

function validate77(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate77.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.name === undefined) {
      const err0 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "name" },
        message: "must have required property '" + "name" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.type === undefined) {
      const err1 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "type" },
        message: "must have required property '" + "type" + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(
        key0 === "cast_to" ||
        key0 === "description" ||
        key0 === "extensions" ||
        key0 === "metadata" ||
        key0 === "name" ||
        key0 === "nullable" ||
        key0 === "tests" ||
        key0 === "type"
      )) {
        const err2 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.cast_to !== undefined) {
      let data0 = data.cast_to;
      const _errs3 = errors;
      let valid1 = false;
      const _errs4 = errors;
      if (typeof data0 !== "string") {
        const err3 = {
          instancePath: instancePath + "/cast_to",
          schemaPath: "#/properties/cast_to/anyOf/0/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
      var _valid0 = _errs4 === errors;
      valid1 = valid1 || _valid0;
      const _errs6 = errors;
      if (data0 !== null) {
        const err4 = {
          instancePath: instancePath + "/cast_to",
          schemaPath: "#/properties/cast_to/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
      var _valid0 = _errs6 === errors;
      valid1 = valid1 || _valid0;
      if (!valid1) {
        const err5 = {
          instancePath: instancePath + "/cast_to",
          schemaPath: "#/properties/cast_to/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      } else {
        errors = _errs3;
        if (vErrors !== null) {
          if (_errs3) {
            vErrors.length = _errs3;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.description !== undefined) {
      let data1 = data.description;
      const _errs9 = errors;
      let valid2 = false;
      const _errs10 = errors;
      if (typeof data1 !== "string") {
        const err6 = {
          instancePath: instancePath + "/description",
          schemaPath: "#/properties/description/anyOf/0/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
      var _valid1 = _errs10 === errors;
      valid2 = valid2 || _valid1;
      const _errs12 = errors;
      if (data1 !== null) {
        const err7 = {
          instancePath: instancePath + "/description",
          schemaPath: "#/properties/description/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
      var _valid1 = _errs12 === errors;
      valid2 = valid2 || _valid1;
      if (!valid2) {
        const err8 = {
          instancePath: instancePath + "/description",
          schemaPath: "#/properties/description/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      } else {
        errors = _errs9;
        if (vErrors !== null) {
          if (_errs9) {
            vErrors.length = _errs9;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.extensions !== undefined) {
      let data2 = data.extensions;
      if (Array.isArray(data2)) {
        const len0 = data2.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data3 = data2[i0];
          if (data3 && typeof data3 == "object" && !Array.isArray(data3)) {
            if (data3.provider === undefined) {
              const err9 = {
                instancePath: instancePath + "/extensions/" + i0,
                schemaPath: "#/$defs/ProviderExtension/required",
                keyword: "required",
                params: { missingProperty: "provider" },
                message: "must have required property '" + "provider" + "'",
              };
              if (vErrors === null) {
                vErrors = [err9];
              } else {
                vErrors.push(err9);
              }
              errors++;
            }
            if (data3.name === undefined) {
              const err10 = {
                instancePath: instancePath + "/extensions/" + i0,
                schemaPath: "#/$defs/ProviderExtension/required",
                keyword: "required",
                params: { missingProperty: "name" },
                message: "must have required property '" + "name" + "'",
              };
              if (vErrors === null) {
                vErrors = [err10];
              } else {
                vErrors.push(err10);
              }
              errors++;
            }
            if (data3.value === undefined) {
              const err11 = {
                instancePath: instancePath + "/extensions/" + i0,
                schemaPath: "#/$defs/ProviderExtension/required",
                keyword: "required",
                params: { missingProperty: "value" },
                message: "must have required property '" + "value" + "'",
              };
              if (vErrors === null) {
                vErrors = [err11];
              } else {
                vErrors.push(err11);
              }
              errors++;
            }
            for (const key1 in data3) {
              if (!(key1 === "name" || key1 === "provider" || key1 === "value")) {
                const err12 = {
                  instancePath: instancePath + "/extensions/" + i0,
                  schemaPath: "#/$defs/ProviderExtension/additionalProperties",
                  keyword: "additionalProperties",
                  params: { additionalProperty: key1 },
                  message: "must NOT have additional properties",
                };
                if (vErrors === null) {
                  vErrors = [err12];
                } else {
                  vErrors.push(err12);
                }
                errors++;
              }
            }
            if (data3.name !== undefined) {
              if (typeof data3.name !== "string") {
                const err13 = {
                  instancePath: instancePath + "/extensions/" + i0 + "/name",
                  schemaPath: "#/$defs/ProviderExtension/properties/name/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string",
                };
                if (vErrors === null) {
                  vErrors = [err13];
                } else {
                  vErrors.push(err13);
                }
                errors++;
              }
            }
            if (data3.provider !== undefined) {
              if (typeof data3.provider !== "string") {
                const err14 = {
                  instancePath: instancePath + "/extensions/" + i0 + "/provider",
                  schemaPath: "#/$defs/ProviderExtension/properties/provider/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string",
                };
                if (vErrors === null) {
                  vErrors = [err14];
                } else {
                  vErrors.push(err14);
                }
                errors++;
              }
            }
            if (data3.value !== undefined) {
              let data6 = data3.value;
              const _errs25 = errors;
              let valid7 = false;
              const _errs26 = errors;
              if (typeof data6 !== "string") {
                const err15 = {
                  instancePath: instancePath + "/extensions/" + i0 + "/value",
                  schemaPath: "#/$defs/ProviderExtension/properties/value/anyOf/0/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string",
                };
                if (vErrors === null) {
                  vErrors = [err15];
                } else {
                  vErrors.push(err15);
                }
                errors++;
              }
              var _valid2 = _errs26 === errors;
              valid7 = valid7 || _valid2;
              const _errs28 = errors;
              if (!(typeof data6 == "number" && !(data6 % 1) && !isNaN(data6) && isFinite(data6))) {
                const err16 = {
                  instancePath: instancePath + "/extensions/" + i0 + "/value",
                  schemaPath: "#/$defs/ProviderExtension/properties/value/anyOf/1/type",
                  keyword: "type",
                  params: { type: "integer" },
                  message: "must be integer",
                };
                if (vErrors === null) {
                  vErrors = [err16];
                } else {
                  vErrors.push(err16);
                }
                errors++;
              }
              var _valid2 = _errs28 === errors;
              valid7 = valid7 || _valid2;
              const _errs30 = errors;
              if (!(typeof data6 == "number" && isFinite(data6))) {
                const err17 = {
                  instancePath: instancePath + "/extensions/" + i0 + "/value",
                  schemaPath: "#/$defs/ProviderExtension/properties/value/anyOf/2/type",
                  keyword: "type",
                  params: { type: "number" },
                  message: "must be number",
                };
                if (vErrors === null) {
                  vErrors = [err17];
                } else {
                  vErrors.push(err17);
                }
                errors++;
              }
              var _valid2 = _errs30 === errors;
              valid7 = valid7 || _valid2;
              const _errs32 = errors;
              if (typeof data6 !== "boolean") {
                const err18 = {
                  instancePath: instancePath + "/extensions/" + i0 + "/value",
                  schemaPath: "#/$defs/ProviderExtension/properties/value/anyOf/3/type",
                  keyword: "type",
                  params: { type: "boolean" },
                  message: "must be boolean",
                };
                if (vErrors === null) {
                  vErrors = [err18];
                } else {
                  vErrors.push(err18);
                }
                errors++;
              }
              var _valid2 = _errs32 === errors;
              valid7 = valid7 || _valid2;
              if (!valid7) {
                const err19 = {
                  instancePath: instancePath + "/extensions/" + i0 + "/value",
                  schemaPath: "#/$defs/ProviderExtension/properties/value/anyOf",
                  keyword: "anyOf",
                  params: {},
                  message: "must match a schema in anyOf",
                };
                if (vErrors === null) {
                  vErrors = [err19];
                } else {
                  vErrors.push(err19);
                }
                errors++;
              } else {
                errors = _errs25;
                if (vErrors !== null) {
                  if (_errs25) {
                    vErrors.length = _errs25;
                  } else {
                    vErrors = null;
                  }
                }
              }
            }
          } else {
            const err20 = {
              instancePath: instancePath + "/extensions/" + i0,
              schemaPath: "#/$defs/ProviderExtension/type",
              keyword: "type",
              params: { type: "object" },
              message: "must be object",
            };
            if (vErrors === null) {
              vErrors = [err20];
            } else {
              vErrors.push(err20);
            }
            errors++;
          }
        }
      } else {
        const err21 = {
          instancePath: instancePath + "/extensions",
          schemaPath: "#/properties/extensions/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array",
        };
        if (vErrors === null) {
          vErrors = [err21];
        } else {
          vErrors.push(err21);
        }
        errors++;
      }
    }
    if (data.metadata !== undefined) {
      if (
        !validate43(data.metadata, {
          instancePath: instancePath + "/metadata",
          parentData: data,
          parentDataProperty: "metadata",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate43.errors : vErrors.concat(validate43.errors);
        errors = vErrors.length;
      }
    }
    if (data.name !== undefined) {
      if (typeof data.name !== "string") {
        const err22 = {
          instancePath: instancePath + "/name",
          schemaPath: "#/properties/name/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
    }
    if (data.nullable !== undefined) {
      if (typeof data.nullable !== "boolean") {
        const err23 = {
          instancePath: instancePath + "/nullable",
          schemaPath: "#/properties/nullable/type",
          keyword: "type",
          params: { type: "boolean" },
          message: "must be boolean",
        };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      }
    }
    if (data.tests !== undefined) {
      let data10 = data.tests;
      if (Array.isArray(data10)) {
        const len1 = data10.length;
        for (let i1 = 0; i1 < len1; i1++) {
          if (
            !validate79(data10[i1], {
              instancePath: instancePath + "/tests/" + i1,
              parentData: data10,
              parentDataProperty: i1,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors = vErrors === null ? validate79.errors : vErrors.concat(validate79.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err24 = {
          instancePath: instancePath + "/tests",
          schemaPath: "#/properties/tests/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array",
        };
        if (vErrors === null) {
          vErrors = [err24];
        } else {
          vErrors.push(err24);
        }
        errors++;
      }
    }
    if (data.type !== undefined) {
      if (typeof data.type !== "string") {
        const err25 = {
          instancePath: instancePath + "/type",
          schemaPath: "#/properties/type/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err25];
        } else {
          vErrors.push(err25);
        }
        errors++;
      }
    }
  } else {
    const err26 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err26];
    } else {
      vErrors.push(err26);
    }
    errors++;
  }
  validate77.errors = vErrors;
  return errors === 0;
}
validate77.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

const schema91 = {
  anyOf: [
    { $ref: "#/$defs/ScheduleTrigger" },
    { $ref: "#/$defs/DependencyTrigger" },
    { $ref: "#/$defs/ManualTrigger" },
  ],
};
const schema92 = {
  additionalProperties: false,
  properties: {
    cron: { minLength: 1, title: "Cron", type: "string" },
    depends_on: { items: { type: "string" }, maxItems: 0, title: "Depends On", type: "array" },
    event: { default: null, title: "Event", type: "null" },
    kind: { const: "schedule", title: "Kind", type: "string" },
    metadata: { $ref: "#/$defs/JsonObject" },
  },
  required: ["kind", "cron"],
  title: "ScheduleTrigger",
  type: "object",
};

function validate96(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate96.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.kind === undefined) {
      const err0 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "kind" },
        message: "must have required property '" + "kind" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.cron === undefined) {
      const err1 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "cron" },
        message: "must have required property '" + "cron" + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(
        key0 === "cron" ||
        key0 === "depends_on" ||
        key0 === "event" ||
        key0 === "kind" ||
        key0 === "metadata"
      )) {
        const err2 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.cron !== undefined) {
      let data0 = data.cron;
      if (typeof data0 === "string") {
        if (func1(data0) < 1) {
          const err3 = {
            instancePath: instancePath + "/cron",
            schemaPath: "#/properties/cron/minLength",
            keyword: "minLength",
            params: { limit: 1 },
            message: "must NOT have fewer than 1 characters",
          };
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        }
      } else {
        const err4 = {
          instancePath: instancePath + "/cron",
          schemaPath: "#/properties/cron/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.depends_on !== undefined) {
      let data1 = data.depends_on;
      if (Array.isArray(data1)) {
        if (data1.length > 0) {
          const err5 = {
            instancePath: instancePath + "/depends_on",
            schemaPath: "#/properties/depends_on/maxItems",
            keyword: "maxItems",
            params: { limit: 0 },
            message: "must NOT have more than 0 items",
          };
          if (vErrors === null) {
            vErrors = [err5];
          } else {
            vErrors.push(err5);
          }
          errors++;
        }
        const len0 = data1.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (typeof data1[i0] !== "string") {
            const err6 = {
              instancePath: instancePath + "/depends_on/" + i0,
              schemaPath: "#/properties/depends_on/items/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string",
            };
            if (vErrors === null) {
              vErrors = [err6];
            } else {
              vErrors.push(err6);
            }
            errors++;
          }
        }
      } else {
        const err7 = {
          instancePath: instancePath + "/depends_on",
          schemaPath: "#/properties/depends_on/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array",
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
    if (data.event !== undefined) {
      if (data.event !== null) {
        const err8 = {
          instancePath: instancePath + "/event",
          schemaPath: "#/properties/event/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.kind !== undefined) {
      let data4 = data.kind;
      if (typeof data4 !== "string") {
        const err9 = {
          instancePath: instancePath + "/kind",
          schemaPath: "#/properties/kind/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
      if ("schedule" !== data4) {
        const err10 = {
          instancePath: instancePath + "/kind",
          schemaPath: "#/properties/kind/const",
          keyword: "const",
          params: { allowedValue: "schedule" },
          message: "must be equal to constant",
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.metadata !== undefined) {
      if (
        !validate43(data.metadata, {
          instancePath: instancePath + "/metadata",
          parentData: data,
          parentDataProperty: "metadata",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate43.errors : vErrors.concat(validate43.errors);
        errors = vErrors.length;
      }
    }
  } else {
    const err11 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err11];
    } else {
      vErrors.push(err11);
    }
    errors++;
  }
  validate96.errors = vErrors;
  return errors === 0;
}
validate96.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

const schema93 = {
  additionalProperties: false,
  properties: {
    cron: { default: null, title: "Cron", type: "null" },
    depends_on: { items: { type: "string" }, minItems: 1, title: "Depends On", type: "array" },
    event: { default: null, title: "Event", type: "null" },
    kind: { const: "dependency", title: "Kind", type: "string" },
    metadata: { $ref: "#/$defs/JsonObject" },
  },
  required: ["kind", "depends_on"],
  title: "DependencyTrigger",
  type: "object",
};

function validate99(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate99.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.kind === undefined) {
      const err0 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "kind" },
        message: "must have required property '" + "kind" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.depends_on === undefined) {
      const err1 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "depends_on" },
        message: "must have required property '" + "depends_on" + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(
        key0 === "cron" ||
        key0 === "depends_on" ||
        key0 === "event" ||
        key0 === "kind" ||
        key0 === "metadata"
      )) {
        const err2 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.cron !== undefined) {
      if (data.cron !== null) {
        const err3 = {
          instancePath: instancePath + "/cron",
          schemaPath: "#/properties/cron/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.depends_on !== undefined) {
      let data1 = data.depends_on;
      if (Array.isArray(data1)) {
        if (data1.length < 1) {
          const err4 = {
            instancePath: instancePath + "/depends_on",
            schemaPath: "#/properties/depends_on/minItems",
            keyword: "minItems",
            params: { limit: 1 },
            message: "must NOT have fewer than 1 items",
          };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
        const len0 = data1.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (typeof data1[i0] !== "string") {
            const err5 = {
              instancePath: instancePath + "/depends_on/" + i0,
              schemaPath: "#/properties/depends_on/items/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string",
            };
            if (vErrors === null) {
              vErrors = [err5];
            } else {
              vErrors.push(err5);
            }
            errors++;
          }
        }
      } else {
        const err6 = {
          instancePath: instancePath + "/depends_on",
          schemaPath: "#/properties/depends_on/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array",
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.event !== undefined) {
      if (data.event !== null) {
        const err7 = {
          instancePath: instancePath + "/event",
          schemaPath: "#/properties/event/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
    if (data.kind !== undefined) {
      let data4 = data.kind;
      if (typeof data4 !== "string") {
        const err8 = {
          instancePath: instancePath + "/kind",
          schemaPath: "#/properties/kind/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
      if ("dependency" !== data4) {
        const err9 = {
          instancePath: instancePath + "/kind",
          schemaPath: "#/properties/kind/const",
          keyword: "const",
          params: { allowedValue: "dependency" },
          message: "must be equal to constant",
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
    if (data.metadata !== undefined) {
      if (
        !validate43(data.metadata, {
          instancePath: instancePath + "/metadata",
          parentData: data,
          parentDataProperty: "metadata",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate43.errors : vErrors.concat(validate43.errors);
        errors = vErrors.length;
      }
    }
  } else {
    const err10 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err10];
    } else {
      vErrors.push(err10);
    }
    errors++;
  }
  validate99.errors = vErrors;
  return errors === 0;
}
validate99.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

const schema94 = {
  additionalProperties: false,
  properties: {
    cron: { default: null, title: "Cron", type: "null" },
    depends_on: { items: { type: "string" }, maxItems: 0, title: "Depends On", type: "array" },
    event: { anyOf: [{ type: "string" }, { type: "null" }], default: null, title: "Event" },
    kind: { const: "manual", title: "Kind", type: "string" },
    metadata: { $ref: "#/$defs/JsonObject" },
  },
  required: ["kind"],
  title: "ManualTrigger",
  type: "object",
};

function validate102(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate102.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.kind === undefined) {
      const err0 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "kind" },
        message: "must have required property '" + "kind" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(
        key0 === "cron" ||
        key0 === "depends_on" ||
        key0 === "event" ||
        key0 === "kind" ||
        key0 === "metadata"
      )) {
        const err1 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
    if (data.cron !== undefined) {
      if (data.cron !== null) {
        const err2 = {
          instancePath: instancePath + "/cron",
          schemaPath: "#/properties/cron/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.depends_on !== undefined) {
      let data1 = data.depends_on;
      if (Array.isArray(data1)) {
        if (data1.length > 0) {
          const err3 = {
            instancePath: instancePath + "/depends_on",
            schemaPath: "#/properties/depends_on/maxItems",
            keyword: "maxItems",
            params: { limit: 0 },
            message: "must NOT have more than 0 items",
          };
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        }
        const len0 = data1.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (typeof data1[i0] !== "string") {
            const err4 = {
              instancePath: instancePath + "/depends_on/" + i0,
              schemaPath: "#/properties/depends_on/items/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string",
            };
            if (vErrors === null) {
              vErrors = [err4];
            } else {
              vErrors.push(err4);
            }
            errors++;
          }
        }
      } else {
        const err5 = {
          instancePath: instancePath + "/depends_on",
          schemaPath: "#/properties/depends_on/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array",
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.event !== undefined) {
      let data3 = data.event;
      const _errs9 = errors;
      let valid3 = false;
      const _errs10 = errors;
      if (typeof data3 !== "string") {
        const err6 = {
          instancePath: instancePath + "/event",
          schemaPath: "#/properties/event/anyOf/0/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
      var _valid0 = _errs10 === errors;
      valid3 = valid3 || _valid0;
      const _errs12 = errors;
      if (data3 !== null) {
        const err7 = {
          instancePath: instancePath + "/event",
          schemaPath: "#/properties/event/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
      var _valid0 = _errs12 === errors;
      valid3 = valid3 || _valid0;
      if (!valid3) {
        const err8 = {
          instancePath: instancePath + "/event",
          schemaPath: "#/properties/event/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      } else {
        errors = _errs9;
        if (vErrors !== null) {
          if (_errs9) {
            vErrors.length = _errs9;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.kind !== undefined) {
      let data4 = data.kind;
      if (typeof data4 !== "string") {
        const err9 = {
          instancePath: instancePath + "/kind",
          schemaPath: "#/properties/kind/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
      if ("manual" !== data4) {
        const err10 = {
          instancePath: instancePath + "/kind",
          schemaPath: "#/properties/kind/const",
          keyword: "const",
          params: { allowedValue: "manual" },
          message: "must be equal to constant",
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.metadata !== undefined) {
      if (
        !validate43(data.metadata, {
          instancePath: instancePath + "/metadata",
          parentData: data,
          parentDataProperty: "metadata",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate43.errors : vErrors.concat(validate43.errors);
        errors = vErrors.length;
      }
    }
  } else {
    const err11 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err11];
    } else {
      vErrors.push(err11);
    }
    errors++;
  }
  validate102.errors = vErrors;
  return errors === 0;
}
validate102.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

function validate95(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate95.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  const _errs0 = errors;
  let valid0 = false;
  const _errs1 = errors;
  if (
    !validate96(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate96.errors : vErrors.concat(validate96.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = true;
  }
  const _errs2 = errors;
  if (
    !validate99(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate99.errors : vErrors.concat(validate99.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = true;
    }
  }
  const _errs3 = errors;
  if (
    !validate102(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate102.errors : vErrors.concat(validate102.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs3 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = true;
    }
  }
  if (!valid0) {
    const err0 = {
      instancePath,
      schemaPath: "#/anyOf",
      keyword: "anyOf",
      params: {},
      message: "must match a schema in anyOf",
    };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate95.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate95.evaluated = { dynamicProps: true, dynamicItems: false };

const schema95 = {
  additionalProperties: false,
  properties: {
    color: { anyOf: [{ type: "string" }, { type: "null" }], default: null, title: "Color" },
    icon: { anyOf: [{ type: "string" }, { type: "null" }], default: null, title: "Icon" },
    position: { anyOf: [{ $ref: "#/$defs/PositionDocument" }, { type: "null" }], default: null },
  },
  title: "NodeVisualDocument",
  type: "object",
};
const schema96 = {
  additionalProperties: false,
  properties: { x: { title: "X", type: "number" }, y: { title: "Y", type: "number" } },
  required: ["x", "y"],
  title: "PositionDocument",
  type: "object",
};

function validate106(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate106.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    for (const key0 in data) {
      if (!(key0 === "color" || key0 === "icon" || key0 === "position")) {
        const err0 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
    if (data.color !== undefined) {
      let data0 = data.color;
      const _errs3 = errors;
      let valid1 = false;
      const _errs4 = errors;
      if (typeof data0 !== "string") {
        const err1 = {
          instancePath: instancePath + "/color",
          schemaPath: "#/properties/color/anyOf/0/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
      var _valid0 = _errs4 === errors;
      valid1 = valid1 || _valid0;
      const _errs6 = errors;
      if (data0 !== null) {
        const err2 = {
          instancePath: instancePath + "/color",
          schemaPath: "#/properties/color/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
      var _valid0 = _errs6 === errors;
      valid1 = valid1 || _valid0;
      if (!valid1) {
        const err3 = {
          instancePath: instancePath + "/color",
          schemaPath: "#/properties/color/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      } else {
        errors = _errs3;
        if (vErrors !== null) {
          if (_errs3) {
            vErrors.length = _errs3;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.icon !== undefined) {
      let data1 = data.icon;
      const _errs9 = errors;
      let valid2 = false;
      const _errs10 = errors;
      if (typeof data1 !== "string") {
        const err4 = {
          instancePath: instancePath + "/icon",
          schemaPath: "#/properties/icon/anyOf/0/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
      var _valid1 = _errs10 === errors;
      valid2 = valid2 || _valid1;
      const _errs12 = errors;
      if (data1 !== null) {
        const err5 = {
          instancePath: instancePath + "/icon",
          schemaPath: "#/properties/icon/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
      var _valid1 = _errs12 === errors;
      valid2 = valid2 || _valid1;
      if (!valid2) {
        const err6 = {
          instancePath: instancePath + "/icon",
          schemaPath: "#/properties/icon/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      } else {
        errors = _errs9;
        if (vErrors !== null) {
          if (_errs9) {
            vErrors.length = _errs9;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.position !== undefined) {
      let data2 = data.position;
      const _errs15 = errors;
      let valid3 = false;
      const _errs16 = errors;
      if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
        if (data2.x === undefined) {
          const err7 = {
            instancePath: instancePath + "/position",
            schemaPath: "#/$defs/PositionDocument/required",
            keyword: "required",
            params: { missingProperty: "x" },
            message: "must have required property '" + "x" + "'",
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
        if (data2.y === undefined) {
          const err8 = {
            instancePath: instancePath + "/position",
            schemaPath: "#/$defs/PositionDocument/required",
            keyword: "required",
            params: { missingProperty: "y" },
            message: "must have required property '" + "y" + "'",
          };
          if (vErrors === null) {
            vErrors = [err8];
          } else {
            vErrors.push(err8);
          }
          errors++;
        }
        for (const key1 in data2) {
          if (!(key1 === "x" || key1 === "y")) {
            const err9 = {
              instancePath: instancePath + "/position",
              schemaPath: "#/$defs/PositionDocument/additionalProperties",
              keyword: "additionalProperties",
              params: { additionalProperty: key1 },
              message: "must NOT have additional properties",
            };
            if (vErrors === null) {
              vErrors = [err9];
            } else {
              vErrors.push(err9);
            }
            errors++;
          }
        }
        if (data2.x !== undefined) {
          let data3 = data2.x;
          if (!(typeof data3 == "number" && isFinite(data3))) {
            const err10 = {
              instancePath: instancePath + "/position/x",
              schemaPath: "#/$defs/PositionDocument/properties/x/type",
              keyword: "type",
              params: { type: "number" },
              message: "must be number",
            };
            if (vErrors === null) {
              vErrors = [err10];
            } else {
              vErrors.push(err10);
            }
            errors++;
          }
        }
        if (data2.y !== undefined) {
          let data4 = data2.y;
          if (!(typeof data4 == "number" && isFinite(data4))) {
            const err11 = {
              instancePath: instancePath + "/position/y",
              schemaPath: "#/$defs/PositionDocument/properties/y/type",
              keyword: "type",
              params: { type: "number" },
              message: "must be number",
            };
            if (vErrors === null) {
              vErrors = [err11];
            } else {
              vErrors.push(err11);
            }
            errors++;
          }
        }
      } else {
        const err12 = {
          instancePath: instancePath + "/position",
          schemaPath: "#/$defs/PositionDocument/type",
          keyword: "type",
          params: { type: "object" },
          message: "must be object",
        };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      }
      var _valid2 = _errs16 === errors;
      valid3 = valid3 || _valid2;
      const _errs24 = errors;
      if (data2 !== null) {
        const err13 = {
          instancePath: instancePath + "/position",
          schemaPath: "#/properties/position/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
      var _valid2 = _errs24 === errors;
      valid3 = valid3 || _valid2;
      if (!valid3) {
        const err14 = {
          instancePath: instancePath + "/position",
          schemaPath: "#/properties/position/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err14];
        } else {
          vErrors.push(err14);
        }
        errors++;
      } else {
        errors = _errs15;
        if (vErrors !== null) {
          if (_errs15) {
            vErrors.length = _errs15;
          } else {
            vErrors = null;
          }
        }
      }
    }
  } else {
    const err15 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err15];
    } else {
      vErrors.push(err15);
    }
    errors++;
  }
  validate106.errors = vErrors;
  return errors === 0;
}
validate106.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

function validate67(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate67.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  const _errs1 = errors;
  const _errs2 = errors;
  if (data && typeof data == "object" && !Array.isArray(data)) {
    let missing0;
    if (
      (data.config === undefined && (missing0 = "config")) ||
      (data.params === undefined && (missing0 = "params"))
    ) {
      const err0 = {};
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
  }
  var valid0 = _errs2 === errors;
  if (valid0) {
    const err1 = {
      instancePath,
      schemaPath: "#/not",
      keyword: "not",
      params: {},
      message: "must NOT be valid",
    };
    if (vErrors === null) {
      vErrors = [err1];
    } else {
      vErrors.push(err1);
    }
    errors++;
  } else {
    errors = _errs1;
    if (vErrors !== null) {
      if (_errs1) {
        vErrors.length = _errs1;
      } else {
        vErrors = null;
      }
    }
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.id === undefined) {
      const err2 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "id" },
        message: "must have required property '" + "id" + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.type === undefined) {
      const err3 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "type" },
        message: "must have required property '" + "type" + "'",
      };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    if (data.name === undefined) {
      const err4 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "name" },
        message: "must have required property '" + "name" + "'",
      };
      if (vErrors === null) {
        vErrors = [err4];
      } else {
        vErrors.push(err4);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!func2.call(schema74.properties, key0)) {
        const err5 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.config !== undefined) {
      if (
        !validate68(data.config, {
          instancePath: instancePath + "/config",
          parentData: data,
          parentDataProperty: "config",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate68.errors : vErrors.concat(validate68.errors);
        errors = vErrors.length;
      }
    }
    if (data.cursor !== undefined) {
      let data1 = data.cursor;
      const _errs6 = errors;
      let valid2 = false;
      const _errs7 = errors;
      if (
        !validate73(data1, {
          instancePath: instancePath + "/cursor",
          parentData: data,
          parentDataProperty: "cursor",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate73.errors : vErrors.concat(validate73.errors);
        errors = vErrors.length;
      }
      var _valid0 = _errs7 === errors;
      valid2 = valid2 || _valid0;
      const _errs8 = errors;
      if (data1 !== null) {
        const err6 = {
          instancePath: instancePath + "/cursor",
          schemaPath: "#/properties/cursor/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
      var _valid0 = _errs8 === errors;
      valid2 = valid2 || _valid0;
      if (!valid2) {
        const err7 = {
          instancePath: instancePath + "/cursor",
          schemaPath: "#/properties/cursor/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      } else {
        errors = _errs6;
        if (vErrors !== null) {
          if (_errs6) {
            vErrors.length = _errs6;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.fields !== undefined) {
      let data2 = data.fields;
      if (Array.isArray(data2)) {
        const len0 = data2.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (
            !validate77(data2[i0], {
              instancePath: instancePath + "/fields/" + i0,
              parentData: data2,
              parentDataProperty: i0,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors = vErrors === null ? validate77.errors : vErrors.concat(validate77.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err8 = {
          instancePath: instancePath + "/fields",
          schemaPath: "#/properties/fields/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array",
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.id !== undefined) {
      if (typeof data.id !== "string") {
        const err9 = {
          instancePath: instancePath + "/id",
          schemaPath: "#/properties/id/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
    if (data.name !== undefined) {
      if (typeof data.name !== "string") {
        const err10 = {
          instancePath: instancePath + "/name",
          schemaPath: "#/properties/name/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.params !== undefined) {
      let data6 = data.params;
      const _errs18 = errors;
      let valid5 = false;
      const _errs19 = errors;
      if (
        !validate68(data6, {
          instancePath: instancePath + "/params",
          parentData: data,
          parentDataProperty: "params",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate68.errors : vErrors.concat(validate68.errors);
        errors = vErrors.length;
      }
      var _valid1 = _errs19 === errors;
      valid5 = valid5 || _valid1;
      const _errs20 = errors;
      if (data6 !== null) {
        const err11 = {
          instancePath: instancePath + "/params",
          schemaPath: "#/properties/params/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
      var _valid1 = _errs20 === errors;
      valid5 = valid5 || _valid1;
      if (!valid5) {
        const err12 = {
          instancePath: instancePath + "/params",
          schemaPath: "#/properties/params/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      } else {
        errors = _errs18;
        if (vErrors !== null) {
          if (_errs18) {
            vErrors.length = _errs18;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.trigger !== undefined) {
      let data7 = data.trigger;
      const _errs24 = errors;
      let valid6 = false;
      const _errs25 = errors;
      if (
        !validate95(data7, {
          instancePath: instancePath + "/trigger",
          parentData: data,
          parentDataProperty: "trigger",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate95.errors : vErrors.concat(validate95.errors);
        errors = vErrors.length;
      }
      var _valid2 = _errs25 === errors;
      valid6 = valid6 || _valid2;
      const _errs26 = errors;
      if (data7 !== null) {
        const err13 = {
          instancePath: instancePath + "/trigger",
          schemaPath: "#/properties/trigger/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
      var _valid2 = _errs26 === errors;
      valid6 = valid6 || _valid2;
      if (!valid6) {
        const err14 = {
          instancePath: instancePath + "/trigger",
          schemaPath: "#/properties/trigger/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err14];
        } else {
          vErrors.push(err14);
        }
        errors++;
      } else {
        errors = _errs24;
        if (vErrors !== null) {
          if (_errs24) {
            vErrors.length = _errs24;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.type !== undefined) {
      let data8 = data.type;
      if (typeof data8 !== "string") {
        const err15 = {
          instancePath: instancePath + "/type",
          schemaPath: "#/properties/type/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err15];
        } else {
          vErrors.push(err15);
        }
        errors++;
      }
      if ("source" !== data8) {
        const err16 = {
          instancePath: instancePath + "/type",
          schemaPath: "#/properties/type/const",
          keyword: "const",
          params: { allowedValue: "source" },
          message: "must be equal to constant",
        };
        if (vErrors === null) {
          vErrors = [err16];
        } else {
          vErrors.push(err16);
        }
        errors++;
      }
    }
    if (data.visual !== undefined) {
      let data9 = data.visual;
      const _errs31 = errors;
      let valid7 = false;
      const _errs32 = errors;
      if (
        !validate106(data9, {
          instancePath: instancePath + "/visual",
          parentData: data,
          parentDataProperty: "visual",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate106.errors : vErrors.concat(validate106.errors);
        errors = vErrors.length;
      }
      var _valid3 = _errs32 === errors;
      valid7 = valid7 || _valid3;
      const _errs33 = errors;
      if (data9 !== null) {
        const err17 = {
          instancePath: instancePath + "/visual",
          schemaPath: "#/properties/visual/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err17];
        } else {
          vErrors.push(err17);
        }
        errors++;
      }
      var _valid3 = _errs33 === errors;
      valid7 = valid7 || _valid3;
      if (!valid7) {
        const err18 = {
          instancePath: instancePath + "/visual",
          schemaPath: "#/properties/visual/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err18];
        } else {
          vErrors.push(err18);
        }
        errors++;
      } else {
        errors = _errs31;
        if (vErrors !== null) {
          if (_errs31) {
            vErrors.length = _errs31;
          } else {
            vErrors = null;
          }
        }
      }
    }
  } else {
    const err19 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err19];
    } else {
      vErrors.push(err19);
    }
    errors++;
  }
  validate67.errors = vErrors;
  return errors === 0;
}
validate67.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

const schema97 = {
  additionalProperties: false,
  not: { required: ["config", "params"] },
  properties: {
    config: { $ref: "#/$defs/TransformNodeConfigDocument" },
    cursor: {
      anyOf: [{ $ref: "#/$defs/CursorStrategyDocument" }, { type: "null" }],
      default: null,
    },
    fields: { items: { $ref: "#/$defs/NodeFieldDocument" }, title: "Fields", type: "array" },
    id: { title: "Id", type: "string" },
    name: { title: "Name", type: "string" },
    params: {
      anyOf: [{ $ref: "#/$defs/TransformNodeConfigDocument" }, { type: "null" }],
      default: null,
      deprecated: true,
      "x-dander-canonical-name": "config",
    },
    trigger: { anyOf: [{ $ref: "#/$defs/TriggerDocument" }, { type: "null" }], default: null },
    type: { const: "transform", title: "Type", type: "string" },
    visual: { anyOf: [{ $ref: "#/$defs/NodeVisualDocument" }, { type: "null" }], default: null },
  },
  required: ["id", "type", "name"],
  title: "TransformNodeDocument",
  type: "object",
};
const schema98 = {
  additionalProperties: { $ref: "#/$defs/JsonValue" },
  properties: {
    join: { anyOf: [{ $ref: "#/$defs/TransformJoinDocument" }, { type: "null" }], default: null },
    operations: {
      items: { $ref: "#/$defs/OperationDocument" },
      title: "Operations",
      type: "array",
    },
  },
  title: "TransformNodeConfigDocument",
  type: "object",
};
const schema100 = {
  additionalProperties: false,
  properties: {
    keys: {
      items: { $ref: "#/$defs/ExecutableJoinKeyDocument" },
      minItems: 1,
      title: "Keys",
      type: "array",
    },
    left_input: { minLength: 1, title: "Left Input", type: "string" },
    right_input: { minLength: 1, title: "Right Input", type: "string" },
    type: { $ref: "#/$defs/ExecutableJoinType" },
  },
  required: ["left_input", "right_input", "type", "keys"],
  title: "TransformJoinDocument",
  type: "object",
};
const schema101 = {
  additionalProperties: false,
  properties: {
    left: { minLength: 1, title: "Left", type: "string" },
    right: { minLength: 1, title: "Right", type: "string" },
  },
  required: ["left", "right"],
  title: "ExecutableJoinKeyDocument",
  type: "object",
};
const schema102 = {
  description: "BigQuery join kinds supported by an executable transform node.",
  enum: ["inner", "left", "right", "full"],
  title: "ExecutableJoinType",
  type: "string",
};

function validate111(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate111.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.left_input === undefined) {
      const err0 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "left_input" },
        message: "must have required property '" + "left_input" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.right_input === undefined) {
      const err1 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "right_input" },
        message: "must have required property '" + "right_input" + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.type === undefined) {
      const err2 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "type" },
        message: "must have required property '" + "type" + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.keys === undefined) {
      const err3 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "keys" },
        message: "must have required property '" + "keys" + "'",
      };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(
        key0 === "keys" ||
        key0 === "left_input" ||
        key0 === "right_input" ||
        key0 === "type"
      )) {
        const err4 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.keys !== undefined) {
      let data0 = data.keys;
      if (Array.isArray(data0)) {
        if (data0.length < 1) {
          const err5 = {
            instancePath: instancePath + "/keys",
            schemaPath: "#/properties/keys/minItems",
            keyword: "minItems",
            params: { limit: 1 },
            message: "must NOT have fewer than 1 items",
          };
          if (vErrors === null) {
            vErrors = [err5];
          } else {
            vErrors.push(err5);
          }
          errors++;
        }
        const len0 = data0.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data1 = data0[i0];
          if (data1 && typeof data1 == "object" && !Array.isArray(data1)) {
            if (data1.left === undefined) {
              const err6 = {
                instancePath: instancePath + "/keys/" + i0,
                schemaPath: "#/$defs/ExecutableJoinKeyDocument/required",
                keyword: "required",
                params: { missingProperty: "left" },
                message: "must have required property '" + "left" + "'",
              };
              if (vErrors === null) {
                vErrors = [err6];
              } else {
                vErrors.push(err6);
              }
              errors++;
            }
            if (data1.right === undefined) {
              const err7 = {
                instancePath: instancePath + "/keys/" + i0,
                schemaPath: "#/$defs/ExecutableJoinKeyDocument/required",
                keyword: "required",
                params: { missingProperty: "right" },
                message: "must have required property '" + "right" + "'",
              };
              if (vErrors === null) {
                vErrors = [err7];
              } else {
                vErrors.push(err7);
              }
              errors++;
            }
            for (const key1 in data1) {
              if (!(key1 === "left" || key1 === "right")) {
                const err8 = {
                  instancePath: instancePath + "/keys/" + i0,
                  schemaPath: "#/$defs/ExecutableJoinKeyDocument/additionalProperties",
                  keyword: "additionalProperties",
                  params: { additionalProperty: key1 },
                  message: "must NOT have additional properties",
                };
                if (vErrors === null) {
                  vErrors = [err8];
                } else {
                  vErrors.push(err8);
                }
                errors++;
              }
            }
            if (data1.left !== undefined) {
              let data2 = data1.left;
              if (typeof data2 === "string") {
                if (func1(data2) < 1) {
                  const err9 = {
                    instancePath: instancePath + "/keys/" + i0 + "/left",
                    schemaPath: "#/$defs/ExecutableJoinKeyDocument/properties/left/minLength",
                    keyword: "minLength",
                    params: { limit: 1 },
                    message: "must NOT have fewer than 1 characters",
                  };
                  if (vErrors === null) {
                    vErrors = [err9];
                  } else {
                    vErrors.push(err9);
                  }
                  errors++;
                }
              } else {
                const err10 = {
                  instancePath: instancePath + "/keys/" + i0 + "/left",
                  schemaPath: "#/$defs/ExecutableJoinKeyDocument/properties/left/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string",
                };
                if (vErrors === null) {
                  vErrors = [err10];
                } else {
                  vErrors.push(err10);
                }
                errors++;
              }
            }
            if (data1.right !== undefined) {
              let data3 = data1.right;
              if (typeof data3 === "string") {
                if (func1(data3) < 1) {
                  const err11 = {
                    instancePath: instancePath + "/keys/" + i0 + "/right",
                    schemaPath: "#/$defs/ExecutableJoinKeyDocument/properties/right/minLength",
                    keyword: "minLength",
                    params: { limit: 1 },
                    message: "must NOT have fewer than 1 characters",
                  };
                  if (vErrors === null) {
                    vErrors = [err11];
                  } else {
                    vErrors.push(err11);
                  }
                  errors++;
                }
              } else {
                const err12 = {
                  instancePath: instancePath + "/keys/" + i0 + "/right",
                  schemaPath: "#/$defs/ExecutableJoinKeyDocument/properties/right/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string",
                };
                if (vErrors === null) {
                  vErrors = [err12];
                } else {
                  vErrors.push(err12);
                }
                errors++;
              }
            }
          } else {
            const err13 = {
              instancePath: instancePath + "/keys/" + i0,
              schemaPath: "#/$defs/ExecutableJoinKeyDocument/type",
              keyword: "type",
              params: { type: "object" },
              message: "must be object",
            };
            if (vErrors === null) {
              vErrors = [err13];
            } else {
              vErrors.push(err13);
            }
            errors++;
          }
        }
      } else {
        const err14 = {
          instancePath: instancePath + "/keys",
          schemaPath: "#/properties/keys/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array",
        };
        if (vErrors === null) {
          vErrors = [err14];
        } else {
          vErrors.push(err14);
        }
        errors++;
      }
    }
    if (data.left_input !== undefined) {
      let data4 = data.left_input;
      if (typeof data4 === "string") {
        if (func1(data4) < 1) {
          const err15 = {
            instancePath: instancePath + "/left_input",
            schemaPath: "#/properties/left_input/minLength",
            keyword: "minLength",
            params: { limit: 1 },
            message: "must NOT have fewer than 1 characters",
          };
          if (vErrors === null) {
            vErrors = [err15];
          } else {
            vErrors.push(err15);
          }
          errors++;
        }
      } else {
        const err16 = {
          instancePath: instancePath + "/left_input",
          schemaPath: "#/properties/left_input/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err16];
        } else {
          vErrors.push(err16);
        }
        errors++;
      }
    }
    if (data.right_input !== undefined) {
      let data5 = data.right_input;
      if (typeof data5 === "string") {
        if (func1(data5) < 1) {
          const err17 = {
            instancePath: instancePath + "/right_input",
            schemaPath: "#/properties/right_input/minLength",
            keyword: "minLength",
            params: { limit: 1 },
            message: "must NOT have fewer than 1 characters",
          };
          if (vErrors === null) {
            vErrors = [err17];
          } else {
            vErrors.push(err17);
          }
          errors++;
        }
      } else {
        const err18 = {
          instancePath: instancePath + "/right_input",
          schemaPath: "#/properties/right_input/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err18];
        } else {
          vErrors.push(err18);
        }
        errors++;
      }
    }
    if (data.type !== undefined) {
      let data6 = data.type;
      if (typeof data6 !== "string") {
        const err19 = {
          instancePath: instancePath + "/type",
          schemaPath: "#/$defs/ExecutableJoinType/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err19];
        } else {
          vErrors.push(err19);
        }
        errors++;
      }
      if (!(data6 === "inner" || data6 === "left" || data6 === "right" || data6 === "full")) {
        const err20 = {
          instancePath: instancePath + "/type",
          schemaPath: "#/$defs/ExecutableJoinType/enum",
          keyword: "enum",
          params: { allowedValues: schema102.enum },
          message: "must be equal to one of the allowed values",
        };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
  } else {
    const err21 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err21];
    } else {
      vErrors.push(err21);
    }
    errors++;
  }
  validate111.errors = vErrors;
  return errors === 0;
}
validate111.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

const schema103 = {
  anyOf: [
    { $ref: "#/$defs/TruncateStringOperation" },
    { $ref: "#/$defs/TrimWhitespaceOperation" },
    { $ref: "#/$defs/DefaultValueOperation" },
    { $ref: "#/$defs/FilterRowsOperation" },
  ],
};
const schema104 = {
  additionalProperties: false,
  properties: {
    kind: { const: "truncate_string", title: "Kind", type: "string" },
    metadata: { $ref: "#/$defs/JsonObject" },
    params: { $ref: "#/$defs/TruncateStringParamsDocument" },
  },
  required: ["kind", "params"],
  title: "TruncateStringOperation",
  type: "object",
};
const schema105 = {
  additionalProperties: false,
  properties: {
    field: { pattern: "^[A-Za-z_][A-Za-z0-9_]*$", title: "Field", type: "string" },
    max_length: { minimum: 0, title: "Max Length", type: "integer" },
  },
  required: ["field", "max_length"],
  title: "TruncateStringParamsDocument",
  type: "object",
};
const pattern8 = new RegExp("^[A-Za-z_][A-Za-z0-9_]*$", "u");

function validate114(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate114.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.kind === undefined) {
      const err0 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "kind" },
        message: "must have required property '" + "kind" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.params === undefined) {
      const err1 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "params" },
        message: "must have required property '" + "params" + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(key0 === "kind" || key0 === "metadata" || key0 === "params")) {
        const err2 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.kind !== undefined) {
      let data0 = data.kind;
      if (typeof data0 !== "string") {
        const err3 = {
          instancePath: instancePath + "/kind",
          schemaPath: "#/properties/kind/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
      if ("truncate_string" !== data0) {
        const err4 = {
          instancePath: instancePath + "/kind",
          schemaPath: "#/properties/kind/const",
          keyword: "const",
          params: { allowedValue: "truncate_string" },
          message: "must be equal to constant",
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.metadata !== undefined) {
      if (
        !validate43(data.metadata, {
          instancePath: instancePath + "/metadata",
          parentData: data,
          parentDataProperty: "metadata",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate43.errors : vErrors.concat(validate43.errors);
        errors = vErrors.length;
      }
    }
    if (data.params !== undefined) {
      let data2 = data.params;
      if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
        if (data2.field === undefined) {
          const err5 = {
            instancePath: instancePath + "/params",
            schemaPath: "#/$defs/TruncateStringParamsDocument/required",
            keyword: "required",
            params: { missingProperty: "field" },
            message: "must have required property '" + "field" + "'",
          };
          if (vErrors === null) {
            vErrors = [err5];
          } else {
            vErrors.push(err5);
          }
          errors++;
        }
        if (data2.max_length === undefined) {
          const err6 = {
            instancePath: instancePath + "/params",
            schemaPath: "#/$defs/TruncateStringParamsDocument/required",
            keyword: "required",
            params: { missingProperty: "max_length" },
            message: "must have required property '" + "max_length" + "'",
          };
          if (vErrors === null) {
            vErrors = [err6];
          } else {
            vErrors.push(err6);
          }
          errors++;
        }
        for (const key1 in data2) {
          if (!(key1 === "field" || key1 === "max_length")) {
            const err7 = {
              instancePath: instancePath + "/params",
              schemaPath: "#/$defs/TruncateStringParamsDocument/additionalProperties",
              keyword: "additionalProperties",
              params: { additionalProperty: key1 },
              message: "must NOT have additional properties",
            };
            if (vErrors === null) {
              vErrors = [err7];
            } else {
              vErrors.push(err7);
            }
            errors++;
          }
        }
        if (data2.field !== undefined) {
          let data3 = data2.field;
          if (typeof data3 === "string") {
            if (!pattern8.test(data3)) {
              const err8 = {
                instancePath: instancePath + "/params/field",
                schemaPath: "#/$defs/TruncateStringParamsDocument/properties/field/pattern",
                keyword: "pattern",
                params: { pattern: "^[A-Za-z_][A-Za-z0-9_]*$" },
                message: 'must match pattern "' + "^[A-Za-z_][A-Za-z0-9_]*$" + '"',
              };
              if (vErrors === null) {
                vErrors = [err8];
              } else {
                vErrors.push(err8);
              }
              errors++;
            }
          } else {
            const err9 = {
              instancePath: instancePath + "/params/field",
              schemaPath: "#/$defs/TruncateStringParamsDocument/properties/field/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string",
            };
            if (vErrors === null) {
              vErrors = [err9];
            } else {
              vErrors.push(err9);
            }
            errors++;
          }
        }
        if (data2.max_length !== undefined) {
          let data4 = data2.max_length;
          if (!(typeof data4 == "number" && !(data4 % 1) && !isNaN(data4) && isFinite(data4))) {
            const err10 = {
              instancePath: instancePath + "/params/max_length",
              schemaPath: "#/$defs/TruncateStringParamsDocument/properties/max_length/type",
              keyword: "type",
              params: { type: "integer" },
              message: "must be integer",
            };
            if (vErrors === null) {
              vErrors = [err10];
            } else {
              vErrors.push(err10);
            }
            errors++;
          }
          if (typeof data4 == "number" && isFinite(data4)) {
            if (data4 < 0 || isNaN(data4)) {
              const err11 = {
                instancePath: instancePath + "/params/max_length",
                schemaPath: "#/$defs/TruncateStringParamsDocument/properties/max_length/minimum",
                keyword: "minimum",
                params: { comparison: ">=", limit: 0 },
                message: "must be >= 0",
              };
              if (vErrors === null) {
                vErrors = [err11];
              } else {
                vErrors.push(err11);
              }
              errors++;
            }
          }
        }
      } else {
        const err12 = {
          instancePath: instancePath + "/params",
          schemaPath: "#/$defs/TruncateStringParamsDocument/type",
          keyword: "type",
          params: { type: "object" },
          message: "must be object",
        };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      }
    }
  } else {
    const err13 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err13];
    } else {
      vErrors.push(err13);
    }
    errors++;
  }
  validate114.errors = vErrors;
  return errors === 0;
}
validate114.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

const schema106 = {
  additionalProperties: false,
  properties: {
    kind: { const: "trim_whitespace", title: "Kind", type: "string" },
    metadata: { $ref: "#/$defs/JsonObject" },
    params: { $ref: "#/$defs/TrimWhitespaceParamsDocument" },
  },
  required: ["kind", "params"],
  title: "TrimWhitespaceOperation",
  type: "object",
};
const schema107 = {
  additionalProperties: false,
  properties: { field: { pattern: "^[A-Za-z_][A-Za-z0-9_]*$", title: "Field", type: "string" } },
  required: ["field"],
  title: "TrimWhitespaceParamsDocument",
  type: "object",
};

function validate117(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate117.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.kind === undefined) {
      const err0 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "kind" },
        message: "must have required property '" + "kind" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.params === undefined) {
      const err1 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "params" },
        message: "must have required property '" + "params" + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(key0 === "kind" || key0 === "metadata" || key0 === "params")) {
        const err2 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.kind !== undefined) {
      let data0 = data.kind;
      if (typeof data0 !== "string") {
        const err3 = {
          instancePath: instancePath + "/kind",
          schemaPath: "#/properties/kind/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
      if ("trim_whitespace" !== data0) {
        const err4 = {
          instancePath: instancePath + "/kind",
          schemaPath: "#/properties/kind/const",
          keyword: "const",
          params: { allowedValue: "trim_whitespace" },
          message: "must be equal to constant",
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.metadata !== undefined) {
      if (
        !validate43(data.metadata, {
          instancePath: instancePath + "/metadata",
          parentData: data,
          parentDataProperty: "metadata",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate43.errors : vErrors.concat(validate43.errors);
        errors = vErrors.length;
      }
    }
    if (data.params !== undefined) {
      let data2 = data.params;
      if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
        if (data2.field === undefined) {
          const err5 = {
            instancePath: instancePath + "/params",
            schemaPath: "#/$defs/TrimWhitespaceParamsDocument/required",
            keyword: "required",
            params: { missingProperty: "field" },
            message: "must have required property '" + "field" + "'",
          };
          if (vErrors === null) {
            vErrors = [err5];
          } else {
            vErrors.push(err5);
          }
          errors++;
        }
        for (const key1 in data2) {
          if (!(key1 === "field")) {
            const err6 = {
              instancePath: instancePath + "/params",
              schemaPath: "#/$defs/TrimWhitespaceParamsDocument/additionalProperties",
              keyword: "additionalProperties",
              params: { additionalProperty: key1 },
              message: "must NOT have additional properties",
            };
            if (vErrors === null) {
              vErrors = [err6];
            } else {
              vErrors.push(err6);
            }
            errors++;
          }
        }
        if (data2.field !== undefined) {
          let data3 = data2.field;
          if (typeof data3 === "string") {
            if (!pattern8.test(data3)) {
              const err7 = {
                instancePath: instancePath + "/params/field",
                schemaPath: "#/$defs/TrimWhitespaceParamsDocument/properties/field/pattern",
                keyword: "pattern",
                params: { pattern: "^[A-Za-z_][A-Za-z0-9_]*$" },
                message: 'must match pattern "' + "^[A-Za-z_][A-Za-z0-9_]*$" + '"',
              };
              if (vErrors === null) {
                vErrors = [err7];
              } else {
                vErrors.push(err7);
              }
              errors++;
            }
          } else {
            const err8 = {
              instancePath: instancePath + "/params/field",
              schemaPath: "#/$defs/TrimWhitespaceParamsDocument/properties/field/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string",
            };
            if (vErrors === null) {
              vErrors = [err8];
            } else {
              vErrors.push(err8);
            }
            errors++;
          }
        }
      } else {
        const err9 = {
          instancePath: instancePath + "/params",
          schemaPath: "#/$defs/TrimWhitespaceParamsDocument/type",
          keyword: "type",
          params: { type: "object" },
          message: "must be object",
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
  } else {
    const err10 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err10];
    } else {
      vErrors.push(err10);
    }
    errors++;
  }
  validate117.errors = vErrors;
  return errors === 0;
}
validate117.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

const schema108 = {
  additionalProperties: false,
  properties: {
    kind: { const: "default_value", title: "Kind", type: "string" },
    metadata: { $ref: "#/$defs/JsonObject" },
    params: { $ref: "#/$defs/DefaultValueParamsDocument" },
  },
  required: ["kind", "params"],
  title: "DefaultValueOperation",
  type: "object",
};
const schema109 = {
  additionalProperties: false,
  properties: {
    default: {
      anyOf: [{ type: "string" }, { type: "integer" }, { type: "number" }, { type: "boolean" }],
      title: "Default",
    },
    field: { pattern: "^[A-Za-z_][A-Za-z0-9_]*$", title: "Field", type: "string" },
  },
  required: ["field", "default"],
  title: "DefaultValueParamsDocument",
  type: "object",
};

function validate120(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate120.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.kind === undefined) {
      const err0 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "kind" },
        message: "must have required property '" + "kind" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.params === undefined) {
      const err1 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "params" },
        message: "must have required property '" + "params" + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(key0 === "kind" || key0 === "metadata" || key0 === "params")) {
        const err2 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.kind !== undefined) {
      let data0 = data.kind;
      if (typeof data0 !== "string") {
        const err3 = {
          instancePath: instancePath + "/kind",
          schemaPath: "#/properties/kind/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
      if ("default_value" !== data0) {
        const err4 = {
          instancePath: instancePath + "/kind",
          schemaPath: "#/properties/kind/const",
          keyword: "const",
          params: { allowedValue: "default_value" },
          message: "must be equal to constant",
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.metadata !== undefined) {
      if (
        !validate43(data.metadata, {
          instancePath: instancePath + "/metadata",
          parentData: data,
          parentDataProperty: "metadata",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate43.errors : vErrors.concat(validate43.errors);
        errors = vErrors.length;
      }
    }
    if (data.params !== undefined) {
      let data2 = data.params;
      if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
        if (data2.field === undefined) {
          const err5 = {
            instancePath: instancePath + "/params",
            schemaPath: "#/$defs/DefaultValueParamsDocument/required",
            keyword: "required",
            params: { missingProperty: "field" },
            message: "must have required property '" + "field" + "'",
          };
          if (vErrors === null) {
            vErrors = [err5];
          } else {
            vErrors.push(err5);
          }
          errors++;
        }
        if (data2.default === undefined) {
          const err6 = {
            instancePath: instancePath + "/params",
            schemaPath: "#/$defs/DefaultValueParamsDocument/required",
            keyword: "required",
            params: { missingProperty: "default" },
            message: "must have required property '" + "default" + "'",
          };
          if (vErrors === null) {
            vErrors = [err6];
          } else {
            vErrors.push(err6);
          }
          errors++;
        }
        for (const key1 in data2) {
          if (!(key1 === "default" || key1 === "field")) {
            const err7 = {
              instancePath: instancePath + "/params",
              schemaPath: "#/$defs/DefaultValueParamsDocument/additionalProperties",
              keyword: "additionalProperties",
              params: { additionalProperty: key1 },
              message: "must NOT have additional properties",
            };
            if (vErrors === null) {
              vErrors = [err7];
            } else {
              vErrors.push(err7);
            }
            errors++;
          }
        }
        if (data2.default !== undefined) {
          let data3 = data2.default;
          const _errs10 = errors;
          let valid3 = false;
          const _errs11 = errors;
          if (typeof data3 !== "string") {
            const err8 = {
              instancePath: instancePath + "/params/default",
              schemaPath: "#/$defs/DefaultValueParamsDocument/properties/default/anyOf/0/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string",
            };
            if (vErrors === null) {
              vErrors = [err8];
            } else {
              vErrors.push(err8);
            }
            errors++;
          }
          var _valid0 = _errs11 === errors;
          valid3 = valid3 || _valid0;
          const _errs13 = errors;
          if (!(typeof data3 == "number" && !(data3 % 1) && !isNaN(data3) && isFinite(data3))) {
            const err9 = {
              instancePath: instancePath + "/params/default",
              schemaPath: "#/$defs/DefaultValueParamsDocument/properties/default/anyOf/1/type",
              keyword: "type",
              params: { type: "integer" },
              message: "must be integer",
            };
            if (vErrors === null) {
              vErrors = [err9];
            } else {
              vErrors.push(err9);
            }
            errors++;
          }
          var _valid0 = _errs13 === errors;
          valid3 = valid3 || _valid0;
          const _errs15 = errors;
          if (!(typeof data3 == "number" && isFinite(data3))) {
            const err10 = {
              instancePath: instancePath + "/params/default",
              schemaPath: "#/$defs/DefaultValueParamsDocument/properties/default/anyOf/2/type",
              keyword: "type",
              params: { type: "number" },
              message: "must be number",
            };
            if (vErrors === null) {
              vErrors = [err10];
            } else {
              vErrors.push(err10);
            }
            errors++;
          }
          var _valid0 = _errs15 === errors;
          valid3 = valid3 || _valid0;
          const _errs17 = errors;
          if (typeof data3 !== "boolean") {
            const err11 = {
              instancePath: instancePath + "/params/default",
              schemaPath: "#/$defs/DefaultValueParamsDocument/properties/default/anyOf/3/type",
              keyword: "type",
              params: { type: "boolean" },
              message: "must be boolean",
            };
            if (vErrors === null) {
              vErrors = [err11];
            } else {
              vErrors.push(err11);
            }
            errors++;
          }
          var _valid0 = _errs17 === errors;
          valid3 = valid3 || _valid0;
          if (!valid3) {
            const err12 = {
              instancePath: instancePath + "/params/default",
              schemaPath: "#/$defs/DefaultValueParamsDocument/properties/default/anyOf",
              keyword: "anyOf",
              params: {},
              message: "must match a schema in anyOf",
            };
            if (vErrors === null) {
              vErrors = [err12];
            } else {
              vErrors.push(err12);
            }
            errors++;
          } else {
            errors = _errs10;
            if (vErrors !== null) {
              if (_errs10) {
                vErrors.length = _errs10;
              } else {
                vErrors = null;
              }
            }
          }
        }
        if (data2.field !== undefined) {
          let data4 = data2.field;
          if (typeof data4 === "string") {
            if (!pattern8.test(data4)) {
              const err13 = {
                instancePath: instancePath + "/params/field",
                schemaPath: "#/$defs/DefaultValueParamsDocument/properties/field/pattern",
                keyword: "pattern",
                params: { pattern: "^[A-Za-z_][A-Za-z0-9_]*$" },
                message: 'must match pattern "' + "^[A-Za-z_][A-Za-z0-9_]*$" + '"',
              };
              if (vErrors === null) {
                vErrors = [err13];
              } else {
                vErrors.push(err13);
              }
              errors++;
            }
          } else {
            const err14 = {
              instancePath: instancePath + "/params/field",
              schemaPath: "#/$defs/DefaultValueParamsDocument/properties/field/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string",
            };
            if (vErrors === null) {
              vErrors = [err14];
            } else {
              vErrors.push(err14);
            }
            errors++;
          }
        }
      } else {
        const err15 = {
          instancePath: instancePath + "/params",
          schemaPath: "#/$defs/DefaultValueParamsDocument/type",
          keyword: "type",
          params: { type: "object" },
          message: "must be object",
        };
        if (vErrors === null) {
          vErrors = [err15];
        } else {
          vErrors.push(err15);
        }
        errors++;
      }
    }
  } else {
    const err16 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err16];
    } else {
      vErrors.push(err16);
    }
    errors++;
  }
  validate120.errors = vErrors;
  return errors === 0;
}
validate120.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

const schema110 = {
  additionalProperties: false,
  properties: {
    kind: { const: "filter_rows", title: "Kind", type: "string" },
    metadata: { $ref: "#/$defs/JsonObject" },
    params: { $ref: "#/$defs/FilterRowsParamsDocument" },
  },
  required: ["kind", "params"],
  title: "FilterRowsOperation",
  type: "object",
};
const schema111 = {
  additionalProperties: false,
  properties: {
    conditions: {
      items: { $ref: "#/$defs/FieldConditionDocument" },
      minItems: 1,
      title: "Conditions",
      type: "array",
    },
    logic: { $ref: "#/$defs/MatchLogic", default: "all" },
  },
  required: ["conditions"],
  title: "FilterRowsParamsDocument",
  type: "object",
};
const schema114 = {
  description: "How a filter's flat condition list combines.",
  enum: ["all", "any"],
  title: "MatchLogic",
  type: "string",
};
const schema112 = {
  additionalProperties: false,
  properties: {
    field: { pattern: "^[A-Za-z_][A-Za-z0-9_]*$", title: "Field", type: "string" },
    op: { $ref: "#/$defs/ComparisonOperator" },
    value: {
      anyOf: [
        { type: "string" },
        { type: "integer" },
        { type: "number" },
        { type: "boolean" },
        {
          items: {
            anyOf: [
              { type: "string" },
              { type: "integer" },
              { type: "number" },
              { type: "boolean" },
            ],
          },
          type: "array",
        },
        { type: "null" },
      ],
      default: null,
      title: "Value",
    },
  },
  required: ["field", "op"],
  title: "FieldConditionDocument",
  type: "object",
};
const schema113 = {
  description: "Closed comparison grammar for ``filter_rows``.",
  enum: ["eq", "ne", "gt", "gte", "lt", "lte", "in", "not_in", "is_null", "is_not_null"],
  title: "ComparisonOperator",
  type: "string",
};

function validate126(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate126.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.field === undefined) {
      const err0 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "field" },
        message: "must have required property '" + "field" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.op === undefined) {
      const err1 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "op" },
        message: "must have required property '" + "op" + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(key0 === "field" || key0 === "op" || key0 === "value")) {
        const err2 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.field !== undefined) {
      let data0 = data.field;
      if (typeof data0 === "string") {
        if (!pattern8.test(data0)) {
          const err3 = {
            instancePath: instancePath + "/field",
            schemaPath: "#/properties/field/pattern",
            keyword: "pattern",
            params: { pattern: "^[A-Za-z_][A-Za-z0-9_]*$" },
            message: 'must match pattern "' + "^[A-Za-z_][A-Za-z0-9_]*$" + '"',
          };
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        }
      } else {
        const err4 = {
          instancePath: instancePath + "/field",
          schemaPath: "#/properties/field/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.op !== undefined) {
      let data1 = data.op;
      if (typeof data1 !== "string") {
        const err5 = {
          instancePath: instancePath + "/op",
          schemaPath: "#/$defs/ComparisonOperator/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
      if (!(
        data1 === "eq" ||
        data1 === "ne" ||
        data1 === "gt" ||
        data1 === "gte" ||
        data1 === "lt" ||
        data1 === "lte" ||
        data1 === "in" ||
        data1 === "not_in" ||
        data1 === "is_null" ||
        data1 === "is_not_null"
      )) {
        const err6 = {
          instancePath: instancePath + "/op",
          schemaPath: "#/$defs/ComparisonOperator/enum",
          keyword: "enum",
          params: { allowedValues: schema113.enum },
          message: "must be equal to one of the allowed values",
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.value !== undefined) {
      let data2 = data.value;
      const _errs8 = errors;
      let valid2 = false;
      const _errs9 = errors;
      if (typeof data2 !== "string") {
        const err7 = {
          instancePath: instancePath + "/value",
          schemaPath: "#/properties/value/anyOf/0/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
      var _valid0 = _errs9 === errors;
      valid2 = valid2 || _valid0;
      const _errs11 = errors;
      if (!(typeof data2 == "number" && !(data2 % 1) && !isNaN(data2) && isFinite(data2))) {
        const err8 = {
          instancePath: instancePath + "/value",
          schemaPath: "#/properties/value/anyOf/1/type",
          keyword: "type",
          params: { type: "integer" },
          message: "must be integer",
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
      var _valid0 = _errs11 === errors;
      valid2 = valid2 || _valid0;
      const _errs13 = errors;
      if (!(typeof data2 == "number" && isFinite(data2))) {
        const err9 = {
          instancePath: instancePath + "/value",
          schemaPath: "#/properties/value/anyOf/2/type",
          keyword: "type",
          params: { type: "number" },
          message: "must be number",
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
      var _valid0 = _errs13 === errors;
      valid2 = valid2 || _valid0;
      const _errs15 = errors;
      if (typeof data2 !== "boolean") {
        const err10 = {
          instancePath: instancePath + "/value",
          schemaPath: "#/properties/value/anyOf/3/type",
          keyword: "type",
          params: { type: "boolean" },
          message: "must be boolean",
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
      var _valid0 = _errs15 === errors;
      valid2 = valid2 || _valid0;
      const _errs17 = errors;
      if (Array.isArray(data2)) {
        const len0 = data2.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data3 = data2[i0];
          const _errs20 = errors;
          let valid5 = false;
          const _errs21 = errors;
          if (typeof data3 !== "string") {
            const err11 = {
              instancePath: instancePath + "/value/" + i0,
              schemaPath: "#/properties/value/anyOf/4/items/anyOf/0/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string",
            };
            if (vErrors === null) {
              vErrors = [err11];
            } else {
              vErrors.push(err11);
            }
            errors++;
          }
          var _valid1 = _errs21 === errors;
          valid5 = valid5 || _valid1;
          const _errs23 = errors;
          if (!(typeof data3 == "number" && !(data3 % 1) && !isNaN(data3) && isFinite(data3))) {
            const err12 = {
              instancePath: instancePath + "/value/" + i0,
              schemaPath: "#/properties/value/anyOf/4/items/anyOf/1/type",
              keyword: "type",
              params: { type: "integer" },
              message: "must be integer",
            };
            if (vErrors === null) {
              vErrors = [err12];
            } else {
              vErrors.push(err12);
            }
            errors++;
          }
          var _valid1 = _errs23 === errors;
          valid5 = valid5 || _valid1;
          const _errs25 = errors;
          if (!(typeof data3 == "number" && isFinite(data3))) {
            const err13 = {
              instancePath: instancePath + "/value/" + i0,
              schemaPath: "#/properties/value/anyOf/4/items/anyOf/2/type",
              keyword: "type",
              params: { type: "number" },
              message: "must be number",
            };
            if (vErrors === null) {
              vErrors = [err13];
            } else {
              vErrors.push(err13);
            }
            errors++;
          }
          var _valid1 = _errs25 === errors;
          valid5 = valid5 || _valid1;
          const _errs27 = errors;
          if (typeof data3 !== "boolean") {
            const err14 = {
              instancePath: instancePath + "/value/" + i0,
              schemaPath: "#/properties/value/anyOf/4/items/anyOf/3/type",
              keyword: "type",
              params: { type: "boolean" },
              message: "must be boolean",
            };
            if (vErrors === null) {
              vErrors = [err14];
            } else {
              vErrors.push(err14);
            }
            errors++;
          }
          var _valid1 = _errs27 === errors;
          valid5 = valid5 || _valid1;
          if (!valid5) {
            const err15 = {
              instancePath: instancePath + "/value/" + i0,
              schemaPath: "#/properties/value/anyOf/4/items/anyOf",
              keyword: "anyOf",
              params: {},
              message: "must match a schema in anyOf",
            };
            if (vErrors === null) {
              vErrors = [err15];
            } else {
              vErrors.push(err15);
            }
            errors++;
          } else {
            errors = _errs20;
            if (vErrors !== null) {
              if (_errs20) {
                vErrors.length = _errs20;
              } else {
                vErrors = null;
              }
            }
          }
        }
      } else {
        const err16 = {
          instancePath: instancePath + "/value",
          schemaPath: "#/properties/value/anyOf/4/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array",
        };
        if (vErrors === null) {
          vErrors = [err16];
        } else {
          vErrors.push(err16);
        }
        errors++;
      }
      var _valid0 = _errs17 === errors;
      valid2 = valid2 || _valid0;
      const _errs29 = errors;
      if (data2 !== null) {
        const err17 = {
          instancePath: instancePath + "/value",
          schemaPath: "#/properties/value/anyOf/5/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err17];
        } else {
          vErrors.push(err17);
        }
        errors++;
      }
      var _valid0 = _errs29 === errors;
      valid2 = valid2 || _valid0;
      if (!valid2) {
        const err18 = {
          instancePath: instancePath + "/value",
          schemaPath: "#/properties/value/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err18];
        } else {
          vErrors.push(err18);
        }
        errors++;
      } else {
        errors = _errs8;
        if (vErrors !== null) {
          if (_errs8) {
            vErrors.length = _errs8;
          } else {
            vErrors = null;
          }
        }
      }
    }
  } else {
    const err19 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err19];
    } else {
      vErrors.push(err19);
    }
    errors++;
  }
  validate126.errors = vErrors;
  return errors === 0;
}
validate126.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

function validate125(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate125.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.conditions === undefined) {
      const err0 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "conditions" },
        message: "must have required property '" + "conditions" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(key0 === "conditions" || key0 === "logic")) {
        const err1 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
    if (data.conditions !== undefined) {
      let data0 = data.conditions;
      if (Array.isArray(data0)) {
        if (data0.length < 1) {
          const err2 = {
            instancePath: instancePath + "/conditions",
            schemaPath: "#/properties/conditions/minItems",
            keyword: "minItems",
            params: { limit: 1 },
            message: "must NOT have fewer than 1 items",
          };
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
        }
        const len0 = data0.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (
            !validate126(data0[i0], {
              instancePath: instancePath + "/conditions/" + i0,
              parentData: data0,
              parentDataProperty: i0,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors = vErrors === null ? validate126.errors : vErrors.concat(validate126.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err3 = {
          instancePath: instancePath + "/conditions",
          schemaPath: "#/properties/conditions/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array",
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.logic !== undefined) {
      let data2 = data.logic;
      if (typeof data2 !== "string") {
        const err4 = {
          instancePath: instancePath + "/logic",
          schemaPath: "#/$defs/MatchLogic/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
      if (!(data2 === "all" || data2 === "any")) {
        const err5 = {
          instancePath: instancePath + "/logic",
          schemaPath: "#/$defs/MatchLogic/enum",
          keyword: "enum",
          params: { allowedValues: schema114.enum },
          message: "must be equal to one of the allowed values",
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
  } else {
    const err6 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err6];
    } else {
      vErrors.push(err6);
    }
    errors++;
  }
  validate125.errors = vErrors;
  return errors === 0;
}
validate125.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

function validate123(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate123.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.kind === undefined) {
      const err0 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "kind" },
        message: "must have required property '" + "kind" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.params === undefined) {
      const err1 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "params" },
        message: "must have required property '" + "params" + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(key0 === "kind" || key0 === "metadata" || key0 === "params")) {
        const err2 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.kind !== undefined) {
      let data0 = data.kind;
      if (typeof data0 !== "string") {
        const err3 = {
          instancePath: instancePath + "/kind",
          schemaPath: "#/properties/kind/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
      if ("filter_rows" !== data0) {
        const err4 = {
          instancePath: instancePath + "/kind",
          schemaPath: "#/properties/kind/const",
          keyword: "const",
          params: { allowedValue: "filter_rows" },
          message: "must be equal to constant",
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.metadata !== undefined) {
      if (
        !validate43(data.metadata, {
          instancePath: instancePath + "/metadata",
          parentData: data,
          parentDataProperty: "metadata",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate43.errors : vErrors.concat(validate43.errors);
        errors = vErrors.length;
      }
    }
    if (data.params !== undefined) {
      if (
        !validate125(data.params, {
          instancePath: instancePath + "/params",
          parentData: data,
          parentDataProperty: "params",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate125.errors : vErrors.concat(validate125.errors);
        errors = vErrors.length;
      }
    }
  } else {
    const err5 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err5];
    } else {
      vErrors.push(err5);
    }
    errors++;
  }
  validate123.errors = vErrors;
  return errors === 0;
}
validate123.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

function validate113(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate113.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  const _errs0 = errors;
  let valid0 = false;
  const _errs1 = errors;
  if (
    !validate114(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate114.errors : vErrors.concat(validate114.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = true;
  }
  const _errs2 = errors;
  if (
    !validate117(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate117.errors : vErrors.concat(validate117.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = true;
    }
  }
  const _errs3 = errors;
  if (
    !validate120(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate120.errors : vErrors.concat(validate120.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs3 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = true;
    }
  }
  const _errs4 = errors;
  if (
    !validate123(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate123.errors : vErrors.concat(validate123.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs4 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = true;
    }
  }
  if (!valid0) {
    const err0 = {
      instancePath,
      schemaPath: "#/anyOf",
      keyword: "anyOf",
      params: {},
      message: "must match a schema in anyOf",
    };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate113.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate113.evaluated = { dynamicProps: true, dynamicItems: false };

function validate110(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate110.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.join !== undefined) {
      let data1 = data.join;
      const _errs4 = errors;
      let valid3 = false;
      const _errs5 = errors;
      if (
        !validate111(data1, {
          instancePath: instancePath + "/join",
          parentData: data,
          parentDataProperty: "join",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate111.errors : vErrors.concat(validate111.errors);
        errors = vErrors.length;
      }
      var _valid0 = _errs5 === errors;
      valid3 = valid3 || _valid0;
      const _errs6 = errors;
      if (data1 !== null) {
        const err0 = {
          instancePath: instancePath + "/join",
          schemaPath: "#/properties/join/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
      var _valid0 = _errs6 === errors;
      valid3 = valid3 || _valid0;
      if (!valid3) {
        const err1 = {
          instancePath: instancePath + "/join",
          schemaPath: "#/properties/join/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      } else {
        errors = _errs4;
        if (vErrors !== null) {
          if (_errs4) {
            vErrors.length = _errs4;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.operations !== undefined) {
      let data2 = data.operations;
      if (Array.isArray(data2)) {
        const len0 = data2.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (
            !validate113(data2[i0], {
              instancePath: instancePath + "/operations/" + i0,
              parentData: data2,
              parentDataProperty: i0,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors = vErrors === null ? validate113.errors : vErrors.concat(validate113.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err2 = {
          instancePath: instancePath + "/operations",
          schemaPath: "#/properties/operations/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array",
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
  } else {
    const err3 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err3];
    } else {
      vErrors.push(err3);
    }
    errors++;
  }
  validate110.errors = vErrors;
  return errors === 0;
}
validate110.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

function validate109(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate109.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  const _errs1 = errors;
  const _errs2 = errors;
  if (data && typeof data == "object" && !Array.isArray(data)) {
    let missing0;
    if (
      (data.config === undefined && (missing0 = "config")) ||
      (data.params === undefined && (missing0 = "params"))
    ) {
      const err0 = {};
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
  }
  var valid0 = _errs2 === errors;
  if (valid0) {
    const err1 = {
      instancePath,
      schemaPath: "#/not",
      keyword: "not",
      params: {},
      message: "must NOT be valid",
    };
    if (vErrors === null) {
      vErrors = [err1];
    } else {
      vErrors.push(err1);
    }
    errors++;
  } else {
    errors = _errs1;
    if (vErrors !== null) {
      if (_errs1) {
        vErrors.length = _errs1;
      } else {
        vErrors = null;
      }
    }
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.id === undefined) {
      const err2 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "id" },
        message: "must have required property '" + "id" + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.type === undefined) {
      const err3 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "type" },
        message: "must have required property '" + "type" + "'",
      };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    if (data.name === undefined) {
      const err4 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "name" },
        message: "must have required property '" + "name" + "'",
      };
      if (vErrors === null) {
        vErrors = [err4];
      } else {
        vErrors.push(err4);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!func2.call(schema97.properties, key0)) {
        const err5 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.config !== undefined) {
      if (
        !validate110(data.config, {
          instancePath: instancePath + "/config",
          parentData: data,
          parentDataProperty: "config",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate110.errors : vErrors.concat(validate110.errors);
        errors = vErrors.length;
      }
    }
    if (data.cursor !== undefined) {
      let data1 = data.cursor;
      const _errs6 = errors;
      let valid2 = false;
      const _errs7 = errors;
      if (
        !validate73(data1, {
          instancePath: instancePath + "/cursor",
          parentData: data,
          parentDataProperty: "cursor",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate73.errors : vErrors.concat(validate73.errors);
        errors = vErrors.length;
      }
      var _valid0 = _errs7 === errors;
      valid2 = valid2 || _valid0;
      const _errs8 = errors;
      if (data1 !== null) {
        const err6 = {
          instancePath: instancePath + "/cursor",
          schemaPath: "#/properties/cursor/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
      var _valid0 = _errs8 === errors;
      valid2 = valid2 || _valid0;
      if (!valid2) {
        const err7 = {
          instancePath: instancePath + "/cursor",
          schemaPath: "#/properties/cursor/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      } else {
        errors = _errs6;
        if (vErrors !== null) {
          if (_errs6) {
            vErrors.length = _errs6;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.fields !== undefined) {
      let data2 = data.fields;
      if (Array.isArray(data2)) {
        const len0 = data2.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (
            !validate77(data2[i0], {
              instancePath: instancePath + "/fields/" + i0,
              parentData: data2,
              parentDataProperty: i0,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors = vErrors === null ? validate77.errors : vErrors.concat(validate77.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err8 = {
          instancePath: instancePath + "/fields",
          schemaPath: "#/properties/fields/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array",
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.id !== undefined) {
      if (typeof data.id !== "string") {
        const err9 = {
          instancePath: instancePath + "/id",
          schemaPath: "#/properties/id/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
    if (data.name !== undefined) {
      if (typeof data.name !== "string") {
        const err10 = {
          instancePath: instancePath + "/name",
          schemaPath: "#/properties/name/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.params !== undefined) {
      let data6 = data.params;
      const _errs18 = errors;
      let valid5 = false;
      const _errs19 = errors;
      if (
        !validate110(data6, {
          instancePath: instancePath + "/params",
          parentData: data,
          parentDataProperty: "params",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate110.errors : vErrors.concat(validate110.errors);
        errors = vErrors.length;
      }
      var _valid1 = _errs19 === errors;
      valid5 = valid5 || _valid1;
      const _errs20 = errors;
      if (data6 !== null) {
        const err11 = {
          instancePath: instancePath + "/params",
          schemaPath: "#/properties/params/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
      var _valid1 = _errs20 === errors;
      valid5 = valid5 || _valid1;
      if (!valid5) {
        const err12 = {
          instancePath: instancePath + "/params",
          schemaPath: "#/properties/params/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      } else {
        errors = _errs18;
        if (vErrors !== null) {
          if (_errs18) {
            vErrors.length = _errs18;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.trigger !== undefined) {
      let data7 = data.trigger;
      const _errs24 = errors;
      let valid6 = false;
      const _errs25 = errors;
      if (
        !validate95(data7, {
          instancePath: instancePath + "/trigger",
          parentData: data,
          parentDataProperty: "trigger",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate95.errors : vErrors.concat(validate95.errors);
        errors = vErrors.length;
      }
      var _valid2 = _errs25 === errors;
      valid6 = valid6 || _valid2;
      const _errs26 = errors;
      if (data7 !== null) {
        const err13 = {
          instancePath: instancePath + "/trigger",
          schemaPath: "#/properties/trigger/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
      var _valid2 = _errs26 === errors;
      valid6 = valid6 || _valid2;
      if (!valid6) {
        const err14 = {
          instancePath: instancePath + "/trigger",
          schemaPath: "#/properties/trigger/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err14];
        } else {
          vErrors.push(err14);
        }
        errors++;
      } else {
        errors = _errs24;
        if (vErrors !== null) {
          if (_errs24) {
            vErrors.length = _errs24;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.type !== undefined) {
      let data8 = data.type;
      if (typeof data8 !== "string") {
        const err15 = {
          instancePath: instancePath + "/type",
          schemaPath: "#/properties/type/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err15];
        } else {
          vErrors.push(err15);
        }
        errors++;
      }
      if ("transform" !== data8) {
        const err16 = {
          instancePath: instancePath + "/type",
          schemaPath: "#/properties/type/const",
          keyword: "const",
          params: { allowedValue: "transform" },
          message: "must be equal to constant",
        };
        if (vErrors === null) {
          vErrors = [err16];
        } else {
          vErrors.push(err16);
        }
        errors++;
      }
    }
    if (data.visual !== undefined) {
      let data9 = data.visual;
      const _errs31 = errors;
      let valid7 = false;
      const _errs32 = errors;
      if (
        !validate106(data9, {
          instancePath: instancePath + "/visual",
          parentData: data,
          parentDataProperty: "visual",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate106.errors : vErrors.concat(validate106.errors);
        errors = vErrors.length;
      }
      var _valid3 = _errs32 === errors;
      valid7 = valid7 || _valid3;
      const _errs33 = errors;
      if (data9 !== null) {
        const err17 = {
          instancePath: instancePath + "/visual",
          schemaPath: "#/properties/visual/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err17];
        } else {
          vErrors.push(err17);
        }
        errors++;
      }
      var _valid3 = _errs33 === errors;
      valid7 = valid7 || _valid3;
      if (!valid7) {
        const err18 = {
          instancePath: instancePath + "/visual",
          schemaPath: "#/properties/visual/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err18];
        } else {
          vErrors.push(err18);
        }
        errors++;
      } else {
        errors = _errs31;
        if (vErrors !== null) {
          if (_errs31) {
            vErrors.length = _errs31;
          } else {
            vErrors = null;
          }
        }
      }
    }
  } else {
    const err19 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err19];
    } else {
      vErrors.push(err19);
    }
    errors++;
  }
  validate109.errors = vErrors;
  return errors === 0;
}
validate109.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

const schema115 = {
  additionalProperties: false,
  not: { required: ["config", "params"] },
  properties: {
    config: { $ref: "#/$defs/TargetNodeConfigDocument" },
    cursor: {
      anyOf: [{ $ref: "#/$defs/CursorStrategyDocument" }, { type: "null" }],
      default: null,
    },
    fields: { items: { $ref: "#/$defs/NodeFieldDocument" }, title: "Fields", type: "array" },
    id: { title: "Id", type: "string" },
    name: { title: "Name", type: "string" },
    params: {
      anyOf: [{ $ref: "#/$defs/TargetNodeConfigDocument" }, { type: "null" }],
      default: null,
      deprecated: true,
      "x-dander-canonical-name": "config",
    },
    trigger: { anyOf: [{ $ref: "#/$defs/TriggerDocument" }, { type: "null" }], default: null },
    type: { const: "target", title: "Type", type: "string" },
    visual: { anyOf: [{ $ref: "#/$defs/NodeVisualDocument" }, { type: "null" }], default: null },
  },
  required: ["id", "type", "name"],
  title: "TargetNodeDocument",
  type: "object",
};
const schema116 = {
  additionalProperties: { $ref: "#/$defs/JsonValue" },
  properties: {
    writer: { anyOf: [{ $ref: "#/$defs/WriterDocument" }, { type: "null" }], default: null },
  },
  title: "TargetNodeConfigDocument",
  type: "object",
};
const schema118 = {
  additionalProperties: false,
  properties: {
    clustering: { items: { type: "string" }, maxItems: 4, title: "Clustering", type: "array" },
    cursor_field: {
      anyOf: [{ type: "string" }, { type: "null" }],
      default: null,
      title: "Cursor Field",
    },
    destination: { $ref: "#/$defs/DestinationDocument" },
    max_batch_rows: {
      default: 10000,
      exclusiveMinimum: 0,
      maximum: 100000,
      title: "Max Batch Rows",
      type: "integer",
    },
    partitioning: {
      anyOf: [{ $ref: "#/$defs/PartitioningDocument" }, { type: "null" }],
      default: null,
    },
    schema_evolution: { $ref: "#/$defs/SchemaEvolution", default: "strict" },
    transport: {
      default: "load_job",
      enum: ["load_job", "storage_write", "copy"],
      title: "Transport",
      type: "string",
    },
    write_mode: { $ref: "#/$defs/WriteMode" },
  },
  required: ["write_mode", "destination"],
  title: "WriterDocument",
  type: "object",
};
const schema119 = {
  additionalProperties: false,
  properties: {
    business_key: { items: { type: "string" }, title: "Business Key", type: "array" },
    dataset: { minLength: 1, title: "Dataset", type: "string" },
    project: { anyOf: [{ type: "string" }, { type: "null" }], default: null, title: "Project" },
    table: { minLength: 1, title: "Table", type: "string" },
  },
  required: ["dataset", "table"],
  title: "DestinationDocument",
  type: "object",
};
const schema122 = {
  description: "How a writer handles declared columns absent from an existing target.",
  enum: ["strict", "additive"],
  title: "SchemaEvolution",
  type: "string",
};
const schema123 = {
  description: "Supported load strategies.",
  enum: ["scd1", "scd2", "snapshot", "incremental", "replace"],
  title: "WriteMode",
  type: "string",
};
const schema120 = {
  additionalProperties: false,
  properties: {
    field: { anyOf: [{ type: "string" }, { type: "null" }], default: null, title: "Field" },
    granularity: { $ref: "#/$defs/PartitioningType", default: "day" },
    require_partition_filter: {
      default: false,
      title: "Require Partition Filter",
      type: "boolean",
    },
  },
  title: "PartitioningDocument",
  type: "object",
};
const schema121 = {
  description:
    "The closed set of time-unit partitioning granularities a `PartitioningSpec` may declare.\n\nA `StrEnum` (matching the `WriteMode`/`TransformationKind`/`JoinType` convention elsewhere in\n`dander.pipeline`), so it serializes to/from its plain string value stably in YAML and JSON;\nan out-of-set value fails validation with a clear `ValidationError`. Scope is deliberately\nlimited to BigQuery time-unit partitioning — integer-range partitioning is a deferred future\nmember (see `steering/02-engineering.md` on avoiding speculative generality).\n\nAttributes:\n    HOUR: Hourly partitions.\n    DAY: Daily partitions — the common case and BigQuery's default granularity.\n    MONTH: Monthly partitions.\n    YEAR: Yearly partitions.",
  enum: ["hour", "day", "month", "year"],
  title: "PartitioningType",
  type: "string",
};

function validate141(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate141.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    for (const key0 in data) {
      if (!(key0 === "field" || key0 === "granularity" || key0 === "require_partition_filter")) {
        const err0 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
    if (data.field !== undefined) {
      let data0 = data.field;
      const _errs3 = errors;
      let valid1 = false;
      const _errs4 = errors;
      if (typeof data0 !== "string") {
        const err1 = {
          instancePath: instancePath + "/field",
          schemaPath: "#/properties/field/anyOf/0/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
      var _valid0 = _errs4 === errors;
      valid1 = valid1 || _valid0;
      const _errs6 = errors;
      if (data0 !== null) {
        const err2 = {
          instancePath: instancePath + "/field",
          schemaPath: "#/properties/field/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
      var _valid0 = _errs6 === errors;
      valid1 = valid1 || _valid0;
      if (!valid1) {
        const err3 = {
          instancePath: instancePath + "/field",
          schemaPath: "#/properties/field/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      } else {
        errors = _errs3;
        if (vErrors !== null) {
          if (_errs3) {
            vErrors.length = _errs3;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.granularity !== undefined) {
      let data1 = data.granularity;
      if (typeof data1 !== "string") {
        const err4 = {
          instancePath: instancePath + "/granularity",
          schemaPath: "#/$defs/PartitioningType/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
      if (!(data1 === "hour" || data1 === "day" || data1 === "month" || data1 === "year")) {
        const err5 = {
          instancePath: instancePath + "/granularity",
          schemaPath: "#/$defs/PartitioningType/enum",
          keyword: "enum",
          params: { allowedValues: schema121.enum },
          message: "must be equal to one of the allowed values",
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.require_partition_filter !== undefined) {
      if (typeof data.require_partition_filter !== "boolean") {
        const err6 = {
          instancePath: instancePath + "/require_partition_filter",
          schemaPath: "#/properties/require_partition_filter/type",
          keyword: "type",
          params: { type: "boolean" },
          message: "must be boolean",
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
  } else {
    const err7 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err7];
    } else {
      vErrors.push(err7);
    }
    errors++;
  }
  validate141.errors = vErrors;
  return errors === 0;
}
validate141.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

function validate140(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate140.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.write_mode === undefined) {
      const err0 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "write_mode" },
        message: "must have required property '" + "write_mode" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.destination === undefined) {
      const err1 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "destination" },
        message: "must have required property '" + "destination" + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(
        key0 === "clustering" ||
        key0 === "cursor_field" ||
        key0 === "destination" ||
        key0 === "max_batch_rows" ||
        key0 === "partitioning" ||
        key0 === "schema_evolution" ||
        key0 === "transport" ||
        key0 === "write_mode"
      )) {
        const err2 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.clustering !== undefined) {
      let data0 = data.clustering;
      if (Array.isArray(data0)) {
        if (data0.length > 4) {
          const err3 = {
            instancePath: instancePath + "/clustering",
            schemaPath: "#/properties/clustering/maxItems",
            keyword: "maxItems",
            params: { limit: 4 },
            message: "must NOT have more than 4 items",
          };
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        }
        const len0 = data0.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (typeof data0[i0] !== "string") {
            const err4 = {
              instancePath: instancePath + "/clustering/" + i0,
              schemaPath: "#/properties/clustering/items/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string",
            };
            if (vErrors === null) {
              vErrors = [err4];
            } else {
              vErrors.push(err4);
            }
            errors++;
          }
        }
      } else {
        const err5 = {
          instancePath: instancePath + "/clustering",
          schemaPath: "#/properties/clustering/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array",
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.cursor_field !== undefined) {
      let data2 = data.cursor_field;
      const _errs7 = errors;
      let valid3 = false;
      const _errs8 = errors;
      if (typeof data2 !== "string") {
        const err6 = {
          instancePath: instancePath + "/cursor_field",
          schemaPath: "#/properties/cursor_field/anyOf/0/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
      var _valid0 = _errs8 === errors;
      valid3 = valid3 || _valid0;
      const _errs10 = errors;
      if (data2 !== null) {
        const err7 = {
          instancePath: instancePath + "/cursor_field",
          schemaPath: "#/properties/cursor_field/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
      var _valid0 = _errs10 === errors;
      valid3 = valid3 || _valid0;
      if (!valid3) {
        const err8 = {
          instancePath: instancePath + "/cursor_field",
          schemaPath: "#/properties/cursor_field/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      } else {
        errors = _errs7;
        if (vErrors !== null) {
          if (_errs7) {
            vErrors.length = _errs7;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.destination !== undefined) {
      let data3 = data.destination;
      if (data3 && typeof data3 == "object" && !Array.isArray(data3)) {
        if (data3.dataset === undefined) {
          const err9 = {
            instancePath: instancePath + "/destination",
            schemaPath: "#/$defs/DestinationDocument/required",
            keyword: "required",
            params: { missingProperty: "dataset" },
            message: "must have required property '" + "dataset" + "'",
          };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
        if (data3.table === undefined) {
          const err10 = {
            instancePath: instancePath + "/destination",
            schemaPath: "#/$defs/DestinationDocument/required",
            keyword: "required",
            params: { missingProperty: "table" },
            message: "must have required property '" + "table" + "'",
          };
          if (vErrors === null) {
            vErrors = [err10];
          } else {
            vErrors.push(err10);
          }
          errors++;
        }
        for (const key1 in data3) {
          if (!(
            key1 === "business_key" ||
            key1 === "dataset" ||
            key1 === "project" ||
            key1 === "table"
          )) {
            const err11 = {
              instancePath: instancePath + "/destination",
              schemaPath: "#/$defs/DestinationDocument/additionalProperties",
              keyword: "additionalProperties",
              params: { additionalProperty: key1 },
              message: "must NOT have additional properties",
            };
            if (vErrors === null) {
              vErrors = [err11];
            } else {
              vErrors.push(err11);
            }
            errors++;
          }
        }
        if (data3.business_key !== undefined) {
          let data4 = data3.business_key;
          if (Array.isArray(data4)) {
            const len1 = data4.length;
            for (let i1 = 0; i1 < len1; i1++) {
              if (typeof data4[i1] !== "string") {
                const err12 = {
                  instancePath: instancePath + "/destination/business_key/" + i1,
                  schemaPath: "#/$defs/DestinationDocument/properties/business_key/items/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string",
                };
                if (vErrors === null) {
                  vErrors = [err12];
                } else {
                  vErrors.push(err12);
                }
                errors++;
              }
            }
          } else {
            const err13 = {
              instancePath: instancePath + "/destination/business_key",
              schemaPath: "#/$defs/DestinationDocument/properties/business_key/type",
              keyword: "type",
              params: { type: "array" },
              message: "must be array",
            };
            if (vErrors === null) {
              vErrors = [err13];
            } else {
              vErrors.push(err13);
            }
            errors++;
          }
        }
        if (data3.dataset !== undefined) {
          let data6 = data3.dataset;
          if (typeof data6 === "string") {
            if (func1(data6) < 1) {
              const err14 = {
                instancePath: instancePath + "/destination/dataset",
                schemaPath: "#/$defs/DestinationDocument/properties/dataset/minLength",
                keyword: "minLength",
                params: { limit: 1 },
                message: "must NOT have fewer than 1 characters",
              };
              if (vErrors === null) {
                vErrors = [err14];
              } else {
                vErrors.push(err14);
              }
              errors++;
            }
          } else {
            const err15 = {
              instancePath: instancePath + "/destination/dataset",
              schemaPath: "#/$defs/DestinationDocument/properties/dataset/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string",
            };
            if (vErrors === null) {
              vErrors = [err15];
            } else {
              vErrors.push(err15);
            }
            errors++;
          }
        }
        if (data3.project !== undefined) {
          let data7 = data3.project;
          const _errs23 = errors;
          let valid8 = false;
          const _errs24 = errors;
          if (typeof data7 !== "string") {
            const err16 = {
              instancePath: instancePath + "/destination/project",
              schemaPath: "#/$defs/DestinationDocument/properties/project/anyOf/0/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string",
            };
            if (vErrors === null) {
              vErrors = [err16];
            } else {
              vErrors.push(err16);
            }
            errors++;
          }
          var _valid1 = _errs24 === errors;
          valid8 = valid8 || _valid1;
          const _errs26 = errors;
          if (data7 !== null) {
            const err17 = {
              instancePath: instancePath + "/destination/project",
              schemaPath: "#/$defs/DestinationDocument/properties/project/anyOf/1/type",
              keyword: "type",
              params: { type: "null" },
              message: "must be null",
            };
            if (vErrors === null) {
              vErrors = [err17];
            } else {
              vErrors.push(err17);
            }
            errors++;
          }
          var _valid1 = _errs26 === errors;
          valid8 = valid8 || _valid1;
          if (!valid8) {
            const err18 = {
              instancePath: instancePath + "/destination/project",
              schemaPath: "#/$defs/DestinationDocument/properties/project/anyOf",
              keyword: "anyOf",
              params: {},
              message: "must match a schema in anyOf",
            };
            if (vErrors === null) {
              vErrors = [err18];
            } else {
              vErrors.push(err18);
            }
            errors++;
          } else {
            errors = _errs23;
            if (vErrors !== null) {
              if (_errs23) {
                vErrors.length = _errs23;
              } else {
                vErrors = null;
              }
            }
          }
        }
        if (data3.table !== undefined) {
          let data8 = data3.table;
          if (typeof data8 === "string") {
            if (func1(data8) < 1) {
              const err19 = {
                instancePath: instancePath + "/destination/table",
                schemaPath: "#/$defs/DestinationDocument/properties/table/minLength",
                keyword: "minLength",
                params: { limit: 1 },
                message: "must NOT have fewer than 1 characters",
              };
              if (vErrors === null) {
                vErrors = [err19];
              } else {
                vErrors.push(err19);
              }
              errors++;
            }
          } else {
            const err20 = {
              instancePath: instancePath + "/destination/table",
              schemaPath: "#/$defs/DestinationDocument/properties/table/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string",
            };
            if (vErrors === null) {
              vErrors = [err20];
            } else {
              vErrors.push(err20);
            }
            errors++;
          }
        }
      } else {
        const err21 = {
          instancePath: instancePath + "/destination",
          schemaPath: "#/$defs/DestinationDocument/type",
          keyword: "type",
          params: { type: "object" },
          message: "must be object",
        };
        if (vErrors === null) {
          vErrors = [err21];
        } else {
          vErrors.push(err21);
        }
        errors++;
      }
    }
    if (data.max_batch_rows !== undefined) {
      let data9 = data.max_batch_rows;
      if (!(typeof data9 == "number" && !(data9 % 1) && !isNaN(data9) && isFinite(data9))) {
        const err22 = {
          instancePath: instancePath + "/max_batch_rows",
          schemaPath: "#/properties/max_batch_rows/type",
          keyword: "type",
          params: { type: "integer" },
          message: "must be integer",
        };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
      if (typeof data9 == "number" && isFinite(data9)) {
        if (data9 > 100000 || isNaN(data9)) {
          const err23 = {
            instancePath: instancePath + "/max_batch_rows",
            schemaPath: "#/properties/max_batch_rows/maximum",
            keyword: "maximum",
            params: { comparison: "<=", limit: 100000 },
            message: "must be <= 100000",
          };
          if (vErrors === null) {
            vErrors = [err23];
          } else {
            vErrors.push(err23);
          }
          errors++;
        }
        if (data9 <= 0 || isNaN(data9)) {
          const err24 = {
            instancePath: instancePath + "/max_batch_rows",
            schemaPath: "#/properties/max_batch_rows/exclusiveMinimum",
            keyword: "exclusiveMinimum",
            params: { comparison: ">", limit: 0 },
            message: "must be > 0",
          };
          if (vErrors === null) {
            vErrors = [err24];
          } else {
            vErrors.push(err24);
          }
          errors++;
        }
      }
    }
    if (data.partitioning !== undefined) {
      let data10 = data.partitioning;
      const _errs33 = errors;
      let valid9 = false;
      const _errs34 = errors;
      if (
        !validate141(data10, {
          instancePath: instancePath + "/partitioning",
          parentData: data,
          parentDataProperty: "partitioning",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate141.errors : vErrors.concat(validate141.errors);
        errors = vErrors.length;
      }
      var _valid2 = _errs34 === errors;
      valid9 = valid9 || _valid2;
      const _errs35 = errors;
      if (data10 !== null) {
        const err25 = {
          instancePath: instancePath + "/partitioning",
          schemaPath: "#/properties/partitioning/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err25];
        } else {
          vErrors.push(err25);
        }
        errors++;
      }
      var _valid2 = _errs35 === errors;
      valid9 = valid9 || _valid2;
      if (!valid9) {
        const err26 = {
          instancePath: instancePath + "/partitioning",
          schemaPath: "#/properties/partitioning/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err26];
        } else {
          vErrors.push(err26);
        }
        errors++;
      } else {
        errors = _errs33;
        if (vErrors !== null) {
          if (_errs33) {
            vErrors.length = _errs33;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.schema_evolution !== undefined) {
      let data11 = data.schema_evolution;
      if (typeof data11 !== "string") {
        const err27 = {
          instancePath: instancePath + "/schema_evolution",
          schemaPath: "#/$defs/SchemaEvolution/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err27];
        } else {
          vErrors.push(err27);
        }
        errors++;
      }
      if (!(data11 === "strict" || data11 === "additive")) {
        const err28 = {
          instancePath: instancePath + "/schema_evolution",
          schemaPath: "#/$defs/SchemaEvolution/enum",
          keyword: "enum",
          params: { allowedValues: schema122.enum },
          message: "must be equal to one of the allowed values",
        };
        if (vErrors === null) {
          vErrors = [err28];
        } else {
          vErrors.push(err28);
        }
        errors++;
      }
    }
    if (data.transport !== undefined) {
      let data12 = data.transport;
      if (typeof data12 !== "string") {
        const err29 = {
          instancePath: instancePath + "/transport",
          schemaPath: "#/properties/transport/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err29];
        } else {
          vErrors.push(err29);
        }
        errors++;
      }
      if (!(data12 === "load_job" || data12 === "storage_write" || data12 === "copy")) {
        const err30 = {
          instancePath: instancePath + "/transport",
          schemaPath: "#/properties/transport/enum",
          keyword: "enum",
          params: { allowedValues: schema118.properties.transport.enum },
          message: "must be equal to one of the allowed values",
        };
        if (vErrors === null) {
          vErrors = [err30];
        } else {
          vErrors.push(err30);
        }
        errors++;
      }
    }
    if (data.write_mode !== undefined) {
      let data13 = data.write_mode;
      if (typeof data13 !== "string") {
        const err31 = {
          instancePath: instancePath + "/write_mode",
          schemaPath: "#/$defs/WriteMode/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err31];
        } else {
          vErrors.push(err31);
        }
        errors++;
      }
      if (!(
        data13 === "scd1" ||
        data13 === "scd2" ||
        data13 === "snapshot" ||
        data13 === "incremental" ||
        data13 === "replace"
      )) {
        const err32 = {
          instancePath: instancePath + "/write_mode",
          schemaPath: "#/$defs/WriteMode/enum",
          keyword: "enum",
          params: { allowedValues: schema123.enum },
          message: "must be equal to one of the allowed values",
        };
        if (vErrors === null) {
          vErrors = [err32];
        } else {
          vErrors.push(err32);
        }
        errors++;
      }
    }
  } else {
    const err33 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err33];
    } else {
      vErrors.push(err33);
    }
    errors++;
  }
  validate140.errors = vErrors;
  return errors === 0;
}
validate140.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

function validate139(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate139.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.writer !== undefined) {
      let data1 = data.writer;
      const _errs4 = errors;
      let valid3 = false;
      const _errs5 = errors;
      if (
        !validate140(data1, {
          instancePath: instancePath + "/writer",
          parentData: data,
          parentDataProperty: "writer",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate140.errors : vErrors.concat(validate140.errors);
        errors = vErrors.length;
      }
      var _valid0 = _errs5 === errors;
      valid3 = valid3 || _valid0;
      const _errs6 = errors;
      if (data1 !== null) {
        const err0 = {
          instancePath: instancePath + "/writer",
          schemaPath: "#/properties/writer/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
      var _valid0 = _errs6 === errors;
      valid3 = valid3 || _valid0;
      if (!valid3) {
        const err1 = {
          instancePath: instancePath + "/writer",
          schemaPath: "#/properties/writer/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      } else {
        errors = _errs4;
        if (vErrors !== null) {
          if (_errs4) {
            vErrors.length = _errs4;
          } else {
            vErrors = null;
          }
        }
      }
    }
  } else {
    const err2 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err2];
    } else {
      vErrors.push(err2);
    }
    errors++;
  }
  validate139.errors = vErrors;
  return errors === 0;
}
validate139.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

function validate138(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate138.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  const _errs1 = errors;
  const _errs2 = errors;
  if (data && typeof data == "object" && !Array.isArray(data)) {
    let missing0;
    if (
      (data.config === undefined && (missing0 = "config")) ||
      (data.params === undefined && (missing0 = "params"))
    ) {
      const err0 = {};
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
  }
  var valid0 = _errs2 === errors;
  if (valid0) {
    const err1 = {
      instancePath,
      schemaPath: "#/not",
      keyword: "not",
      params: {},
      message: "must NOT be valid",
    };
    if (vErrors === null) {
      vErrors = [err1];
    } else {
      vErrors.push(err1);
    }
    errors++;
  } else {
    errors = _errs1;
    if (vErrors !== null) {
      if (_errs1) {
        vErrors.length = _errs1;
      } else {
        vErrors = null;
      }
    }
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.id === undefined) {
      const err2 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "id" },
        message: "must have required property '" + "id" + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.type === undefined) {
      const err3 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "type" },
        message: "must have required property '" + "type" + "'",
      };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    if (data.name === undefined) {
      const err4 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "name" },
        message: "must have required property '" + "name" + "'",
      };
      if (vErrors === null) {
        vErrors = [err4];
      } else {
        vErrors.push(err4);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!func2.call(schema115.properties, key0)) {
        const err5 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.config !== undefined) {
      if (
        !validate139(data.config, {
          instancePath: instancePath + "/config",
          parentData: data,
          parentDataProperty: "config",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate139.errors : vErrors.concat(validate139.errors);
        errors = vErrors.length;
      }
    }
    if (data.cursor !== undefined) {
      let data1 = data.cursor;
      const _errs6 = errors;
      let valid2 = false;
      const _errs7 = errors;
      if (
        !validate73(data1, {
          instancePath: instancePath + "/cursor",
          parentData: data,
          parentDataProperty: "cursor",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate73.errors : vErrors.concat(validate73.errors);
        errors = vErrors.length;
      }
      var _valid0 = _errs7 === errors;
      valid2 = valid2 || _valid0;
      const _errs8 = errors;
      if (data1 !== null) {
        const err6 = {
          instancePath: instancePath + "/cursor",
          schemaPath: "#/properties/cursor/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
      var _valid0 = _errs8 === errors;
      valid2 = valid2 || _valid0;
      if (!valid2) {
        const err7 = {
          instancePath: instancePath + "/cursor",
          schemaPath: "#/properties/cursor/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      } else {
        errors = _errs6;
        if (vErrors !== null) {
          if (_errs6) {
            vErrors.length = _errs6;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.fields !== undefined) {
      let data2 = data.fields;
      if (Array.isArray(data2)) {
        const len0 = data2.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (
            !validate77(data2[i0], {
              instancePath: instancePath + "/fields/" + i0,
              parentData: data2,
              parentDataProperty: i0,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors = vErrors === null ? validate77.errors : vErrors.concat(validate77.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err8 = {
          instancePath: instancePath + "/fields",
          schemaPath: "#/properties/fields/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array",
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.id !== undefined) {
      if (typeof data.id !== "string") {
        const err9 = {
          instancePath: instancePath + "/id",
          schemaPath: "#/properties/id/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
    if (data.name !== undefined) {
      if (typeof data.name !== "string") {
        const err10 = {
          instancePath: instancePath + "/name",
          schemaPath: "#/properties/name/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.params !== undefined) {
      let data6 = data.params;
      const _errs18 = errors;
      let valid5 = false;
      const _errs19 = errors;
      if (
        !validate139(data6, {
          instancePath: instancePath + "/params",
          parentData: data,
          parentDataProperty: "params",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate139.errors : vErrors.concat(validate139.errors);
        errors = vErrors.length;
      }
      var _valid1 = _errs19 === errors;
      valid5 = valid5 || _valid1;
      const _errs20 = errors;
      if (data6 !== null) {
        const err11 = {
          instancePath: instancePath + "/params",
          schemaPath: "#/properties/params/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
      var _valid1 = _errs20 === errors;
      valid5 = valid5 || _valid1;
      if (!valid5) {
        const err12 = {
          instancePath: instancePath + "/params",
          schemaPath: "#/properties/params/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      } else {
        errors = _errs18;
        if (vErrors !== null) {
          if (_errs18) {
            vErrors.length = _errs18;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.trigger !== undefined) {
      let data7 = data.trigger;
      const _errs24 = errors;
      let valid6 = false;
      const _errs25 = errors;
      if (
        !validate95(data7, {
          instancePath: instancePath + "/trigger",
          parentData: data,
          parentDataProperty: "trigger",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate95.errors : vErrors.concat(validate95.errors);
        errors = vErrors.length;
      }
      var _valid2 = _errs25 === errors;
      valid6 = valid6 || _valid2;
      const _errs26 = errors;
      if (data7 !== null) {
        const err13 = {
          instancePath: instancePath + "/trigger",
          schemaPath: "#/properties/trigger/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
      var _valid2 = _errs26 === errors;
      valid6 = valid6 || _valid2;
      if (!valid6) {
        const err14 = {
          instancePath: instancePath + "/trigger",
          schemaPath: "#/properties/trigger/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err14];
        } else {
          vErrors.push(err14);
        }
        errors++;
      } else {
        errors = _errs24;
        if (vErrors !== null) {
          if (_errs24) {
            vErrors.length = _errs24;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.type !== undefined) {
      let data8 = data.type;
      if (typeof data8 !== "string") {
        const err15 = {
          instancePath: instancePath + "/type",
          schemaPath: "#/properties/type/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err15];
        } else {
          vErrors.push(err15);
        }
        errors++;
      }
      if ("target" !== data8) {
        const err16 = {
          instancePath: instancePath + "/type",
          schemaPath: "#/properties/type/const",
          keyword: "const",
          params: { allowedValue: "target" },
          message: "must be equal to constant",
        };
        if (vErrors === null) {
          vErrors = [err16];
        } else {
          vErrors.push(err16);
        }
        errors++;
      }
    }
    if (data.visual !== undefined) {
      let data9 = data.visual;
      const _errs31 = errors;
      let valid7 = false;
      const _errs32 = errors;
      if (
        !validate106(data9, {
          instancePath: instancePath + "/visual",
          parentData: data,
          parentDataProperty: "visual",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate106.errors : vErrors.concat(validate106.errors);
        errors = vErrors.length;
      }
      var _valid3 = _errs32 === errors;
      valid7 = valid7 || _valid3;
      const _errs33 = errors;
      if (data9 !== null) {
        const err17 = {
          instancePath: instancePath + "/visual",
          schemaPath: "#/properties/visual/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err17];
        } else {
          vErrors.push(err17);
        }
        errors++;
      }
      var _valid3 = _errs33 === errors;
      valid7 = valid7 || _valid3;
      if (!valid7) {
        const err18 = {
          instancePath: instancePath + "/visual",
          schemaPath: "#/properties/visual/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err18];
        } else {
          vErrors.push(err18);
        }
        errors++;
      } else {
        errors = _errs31;
        if (vErrors !== null) {
          if (_errs31) {
            vErrors.length = _errs31;
          } else {
            vErrors = null;
          }
        }
      }
    }
  } else {
    const err19 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err19];
    } else {
      vErrors.push(err19);
    }
    errors++;
  }
  validate138.errors = vErrors;
  return errors === 0;
}
validate138.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

const schema124 = {
  additionalProperties: false,
  not: { required: ["config", "params"] },
  properties: {
    config: { $ref: "#/$defs/JsonObject" },
    cursor: {
      anyOf: [{ $ref: "#/$defs/CursorStrategyDocument" }, { type: "null" }],
      default: null,
    },
    fields: { items: { $ref: "#/$defs/NodeFieldDocument" }, title: "Fields", type: "array" },
    id: { title: "Id", type: "string" },
    name: { title: "Name", type: "string" },
    params: {
      anyOf: [{ $ref: "#/$defs/JsonObject" }, { type: "null" }],
      default: null,
      deprecated: true,
      "x-dander-canonical-name": "config",
    },
    trigger: { anyOf: [{ $ref: "#/$defs/TriggerDocument" }, { type: "null" }], default: null },
    type: { $ref: "#/$defs/ExtensionNodeType" },
    visual: { anyOf: [{ $ref: "#/$defs/NodeVisualDocument" }, { type: "null" }], default: null },
  },
  required: ["id", "type", "name"],
  title: "ExtensionNodeDocument",
  type: "object",
};
const schema125 = { not: { enum: ["source", "transform", "target"] }, type: "string" };

function validate151(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate151.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  const _errs1 = errors;
  const _errs2 = errors;
  if (data && typeof data == "object" && !Array.isArray(data)) {
    let missing0;
    if (
      (data.config === undefined && (missing0 = "config")) ||
      (data.params === undefined && (missing0 = "params"))
    ) {
      const err0 = {};
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
  }
  var valid0 = _errs2 === errors;
  if (valid0) {
    const err1 = {
      instancePath,
      schemaPath: "#/not",
      keyword: "not",
      params: {},
      message: "must NOT be valid",
    };
    if (vErrors === null) {
      vErrors = [err1];
    } else {
      vErrors.push(err1);
    }
    errors++;
  } else {
    errors = _errs1;
    if (vErrors !== null) {
      if (_errs1) {
        vErrors.length = _errs1;
      } else {
        vErrors = null;
      }
    }
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.id === undefined) {
      const err2 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "id" },
        message: "must have required property '" + "id" + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.type === undefined) {
      const err3 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "type" },
        message: "must have required property '" + "type" + "'",
      };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    if (data.name === undefined) {
      const err4 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "name" },
        message: "must have required property '" + "name" + "'",
      };
      if (vErrors === null) {
        vErrors = [err4];
      } else {
        vErrors.push(err4);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!func2.call(schema124.properties, key0)) {
        const err5 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.config !== undefined) {
      if (
        !validate43(data.config, {
          instancePath: instancePath + "/config",
          parentData: data,
          parentDataProperty: "config",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate43.errors : vErrors.concat(validate43.errors);
        errors = vErrors.length;
      }
    }
    if (data.cursor !== undefined) {
      let data1 = data.cursor;
      const _errs6 = errors;
      let valid2 = false;
      const _errs7 = errors;
      if (
        !validate73(data1, {
          instancePath: instancePath + "/cursor",
          parentData: data,
          parentDataProperty: "cursor",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate73.errors : vErrors.concat(validate73.errors);
        errors = vErrors.length;
      }
      var _valid0 = _errs7 === errors;
      valid2 = valid2 || _valid0;
      const _errs8 = errors;
      if (data1 !== null) {
        const err6 = {
          instancePath: instancePath + "/cursor",
          schemaPath: "#/properties/cursor/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
      var _valid0 = _errs8 === errors;
      valid2 = valid2 || _valid0;
      if (!valid2) {
        const err7 = {
          instancePath: instancePath + "/cursor",
          schemaPath: "#/properties/cursor/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      } else {
        errors = _errs6;
        if (vErrors !== null) {
          if (_errs6) {
            vErrors.length = _errs6;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.fields !== undefined) {
      let data2 = data.fields;
      if (Array.isArray(data2)) {
        const len0 = data2.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (
            !validate77(data2[i0], {
              instancePath: instancePath + "/fields/" + i0,
              parentData: data2,
              parentDataProperty: i0,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors = vErrors === null ? validate77.errors : vErrors.concat(validate77.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err8 = {
          instancePath: instancePath + "/fields",
          schemaPath: "#/properties/fields/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array",
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.id !== undefined) {
      if (typeof data.id !== "string") {
        const err9 = {
          instancePath: instancePath + "/id",
          schemaPath: "#/properties/id/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
    if (data.name !== undefined) {
      if (typeof data.name !== "string") {
        const err10 = {
          instancePath: instancePath + "/name",
          schemaPath: "#/properties/name/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.params !== undefined) {
      let data6 = data.params;
      const _errs18 = errors;
      let valid5 = false;
      const _errs19 = errors;
      if (
        !validate43(data6, {
          instancePath: instancePath + "/params",
          parentData: data,
          parentDataProperty: "params",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate43.errors : vErrors.concat(validate43.errors);
        errors = vErrors.length;
      }
      var _valid1 = _errs19 === errors;
      valid5 = valid5 || _valid1;
      const _errs20 = errors;
      if (data6 !== null) {
        const err11 = {
          instancePath: instancePath + "/params",
          schemaPath: "#/properties/params/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
      var _valid1 = _errs20 === errors;
      valid5 = valid5 || _valid1;
      if (!valid5) {
        const err12 = {
          instancePath: instancePath + "/params",
          schemaPath: "#/properties/params/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      } else {
        errors = _errs18;
        if (vErrors !== null) {
          if (_errs18) {
            vErrors.length = _errs18;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.trigger !== undefined) {
      let data7 = data.trigger;
      const _errs24 = errors;
      let valid6 = false;
      const _errs25 = errors;
      if (
        !validate95(data7, {
          instancePath: instancePath + "/trigger",
          parentData: data,
          parentDataProperty: "trigger",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate95.errors : vErrors.concat(validate95.errors);
        errors = vErrors.length;
      }
      var _valid2 = _errs25 === errors;
      valid6 = valid6 || _valid2;
      const _errs26 = errors;
      if (data7 !== null) {
        const err13 = {
          instancePath: instancePath + "/trigger",
          schemaPath: "#/properties/trigger/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
      var _valid2 = _errs26 === errors;
      valid6 = valid6 || _valid2;
      if (!valid6) {
        const err14 = {
          instancePath: instancePath + "/trigger",
          schemaPath: "#/properties/trigger/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err14];
        } else {
          vErrors.push(err14);
        }
        errors++;
      } else {
        errors = _errs24;
        if (vErrors !== null) {
          if (_errs24) {
            vErrors.length = _errs24;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.type !== undefined) {
      let data8 = data.type;
      if (typeof data8 !== "string") {
        const err15 = {
          instancePath: instancePath + "/type",
          schemaPath: "#/$defs/ExtensionNodeType/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err15];
        } else {
          vErrors.push(err15);
        }
        errors++;
      }
      const _errs31 = errors;
      const _errs32 = errors;
      if (!(data8 === "source" || data8 === "transform" || data8 === "target")) {
        const err16 = {};
        if (vErrors === null) {
          vErrors = [err16];
        } else {
          vErrors.push(err16);
        }
        errors++;
      }
      var valid8 = _errs32 === errors;
      if (valid8) {
        const err17 = {
          instancePath: instancePath + "/type",
          schemaPath: "#/$defs/ExtensionNodeType/not",
          keyword: "not",
          params: {},
          message: "must NOT be valid",
        };
        if (vErrors === null) {
          vErrors = [err17];
        } else {
          vErrors.push(err17);
        }
        errors++;
      } else {
        errors = _errs31;
        if (vErrors !== null) {
          if (_errs31) {
            vErrors.length = _errs31;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.visual !== undefined) {
      let data9 = data.visual;
      const _errs34 = errors;
      let valid9 = false;
      const _errs35 = errors;
      if (
        !validate106(data9, {
          instancePath: instancePath + "/visual",
          parentData: data,
          parentDataProperty: "visual",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate106.errors : vErrors.concat(validate106.errors);
        errors = vErrors.length;
      }
      var _valid3 = _errs35 === errors;
      valid9 = valid9 || _valid3;
      const _errs36 = errors;
      if (data9 !== null) {
        const err18 = {
          instancePath: instancePath + "/visual",
          schemaPath: "#/properties/visual/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err18];
        } else {
          vErrors.push(err18);
        }
        errors++;
      }
      var _valid3 = _errs36 === errors;
      valid9 = valid9 || _valid3;
      if (!valid9) {
        const err19 = {
          instancePath: instancePath + "/visual",
          schemaPath: "#/properties/visual/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err19];
        } else {
          vErrors.push(err19);
        }
        errors++;
      } else {
        errors = _errs34;
        if (vErrors !== null) {
          if (_errs34) {
            vErrors.length = _errs34;
          } else {
            vErrors = null;
          }
        }
      }
    }
  } else {
    const err20 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err20];
    } else {
      vErrors.push(err20);
    }
    errors++;
  }
  validate151.errors = vErrors;
  return errors === 0;
}
validate151.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

function validate66(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate66.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  const _errs0 = errors;
  let valid0 = false;
  const _errs1 = errors;
  if (
    !validate67(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate67.errors : vErrors.concat(validate67.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = true;
  }
  const _errs2 = errors;
  if (
    !validate109(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate109.errors : vErrors.concat(validate109.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = true;
    }
  }
  const _errs3 = errors;
  if (
    !validate138(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate138.errors : vErrors.concat(validate138.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs3 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = true;
    }
  }
  const _errs4 = errors;
  if (
    !validate151(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate151.errors : vErrors.concat(validate151.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs4 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = true;
    }
  }
  if (!valid0) {
    const err0 = {
      instancePath,
      schemaPath: "#/anyOf",
      keyword: "anyOf",
      params: {},
      message: "must match a schema in anyOf",
    };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate66.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate66.evaluated = { dynamicProps: true, dynamicItems: false };

function validate40(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="urn:dander:control:contracts:v1:pipeline-graph" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate40.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.name === undefined) {
      const err0 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "name" },
        message: "must have required property '" + "name" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(key0 === "edges" || key0 === "name" || key0 === "nodes" || key0 === "trigger")) {
        const err1 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
    if (data.edges !== undefined) {
      let data0 = data.edges;
      if (Array.isArray(data0)) {
        const len0 = data0.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (
            !validate41(data0[i0], {
              instancePath: instancePath + "/edges/" + i0,
              parentData: data0,
              parentDataProperty: i0,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors = vErrors === null ? validate41.errors : vErrors.concat(validate41.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err2 = {
          instancePath: instancePath + "/edges",
          schemaPath: "#/properties/edges/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array",
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.name !== undefined) {
      if (typeof data.name !== "string") {
        const err3 = {
          instancePath: instancePath + "/name",
          schemaPath: "#/properties/name/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.nodes !== undefined) {
      let data3 = data.nodes;
      if (Array.isArray(data3)) {
        const len1 = data3.length;
        for (let i1 = 0; i1 < len1; i1++) {
          if (
            !validate66(data3[i1], {
              instancePath: instancePath + "/nodes/" + i1,
              parentData: data3,
              parentDataProperty: i1,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors = vErrors === null ? validate66.errors : vErrors.concat(validate66.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err4 = {
          instancePath: instancePath + "/nodes",
          schemaPath: "#/properties/nodes/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array",
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.trigger !== undefined) {
      let data5 = data.trigger;
      const _errs11 = errors;
      let valid5 = false;
      const _errs12 = errors;
      if (
        !validate95(data5, {
          instancePath: instancePath + "/trigger",
          parentData: data,
          parentDataProperty: "trigger",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate95.errors : vErrors.concat(validate95.errors);
        errors = vErrors.length;
      }
      var _valid0 = _errs12 === errors;
      valid5 = valid5 || _valid0;
      const _errs13 = errors;
      if (data5 !== null) {
        const err5 = {
          instancePath: instancePath + "/trigger",
          schemaPath: "#/properties/trigger/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
      var _valid0 = _errs13 === errors;
      valid5 = valid5 || _valid0;
      if (!valid5) {
        const err6 = {
          instancePath: instancePath + "/trigger",
          schemaPath: "#/properties/trigger/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      } else {
        errors = _errs11;
        if (vErrors !== null) {
          if (_errs11) {
            vErrors.length = _errs11;
          } else {
            vErrors = null;
          }
        }
      }
    }
  } else {
    const err7 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err7];
    } else {
      vErrors.push(err7);
    }
    errors++;
  }
  validate40.errors = vErrors;
  return errors === 0;
}
validate40.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

export const validatePluginCatalog = validate161;
const schema126 = {
  $defs: {
    PluginCatalogRecord: {
      additionalProperties: false,
      properties: {
        compatible: { title: "Compatible", type: "boolean" },
        dander_specifier: { title: "Dander Specifier", type: "string" },
        description: { title: "Description", type: "string" },
        display_name: { title: "Display Name", type: "string" },
        distribution: { title: "Distribution", type: "string" },
        documentation_url: { title: "Documentation Url", type: "string" },
        id: { title: "Id", type: "string" },
        installed: { title: "Installed", type: "boolean" },
        installed_version: {
          anyOf: [{ type: "string" }, { type: "null" }],
          default: null,
          title: "Installed Version",
        },
        pypi_url: { title: "Pypi Url", type: "string" },
        repository_url: { title: "Repository Url", type: "string" },
        support_status: { title: "Support Status", type: "string" },
        validation_status: { title: "Validation Status", type: "string" },
        version: { title: "Version", type: "string" },
      },
      required: [
        "id",
        "display_name",
        "description",
        "distribution",
        "version",
        "dander_specifier",
        "compatible",
        "support_status",
        "validation_status",
        "documentation_url",
        "pypi_url",
        "repository_url",
        "installed",
      ],
      title: "PluginCatalogRecord",
      type: "object",
    },
  },
  $id: "urn:dander:control:contracts:v1:plugin-catalog",
  $schema: "https://json-schema.org/draft/2020-12/schema",
  additionalProperties: false,
  properties: {
    connectors: {
      items: { $ref: "#/$defs/PluginCatalogRecord" },
      title: "Connectors",
      type: "array",
    },
    dander_version: { title: "Dander Version", type: "string" },
    schema_version: { const: 1, default: 1, title: "Schema Version", type: "integer" },
  },
  required: ["dander_version"],
  title: "PluginCatalogResponse",
  type: "object",
};
const schema127 = {
  additionalProperties: false,
  properties: {
    compatible: { title: "Compatible", type: "boolean" },
    dander_specifier: { title: "Dander Specifier", type: "string" },
    description: { title: "Description", type: "string" },
    display_name: { title: "Display Name", type: "string" },
    distribution: { title: "Distribution", type: "string" },
    documentation_url: { title: "Documentation Url", type: "string" },
    id: { title: "Id", type: "string" },
    installed: { title: "Installed", type: "boolean" },
    installed_version: {
      anyOf: [{ type: "string" }, { type: "null" }],
      default: null,
      title: "Installed Version",
    },
    pypi_url: { title: "Pypi Url", type: "string" },
    repository_url: { title: "Repository Url", type: "string" },
    support_status: { title: "Support Status", type: "string" },
    validation_status: { title: "Validation Status", type: "string" },
    version: { title: "Version", type: "string" },
  },
  required: [
    "id",
    "display_name",
    "description",
    "distribution",
    "version",
    "dander_specifier",
    "compatible",
    "support_status",
    "validation_status",
    "documentation_url",
    "pypi_url",
    "repository_url",
    "installed",
  ],
  title: "PluginCatalogRecord",
  type: "object",
};

function validate161(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="urn:dander:control:contracts:v1:plugin-catalog" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate161.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.dander_version === undefined) {
      const err0 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "dander_version" },
        message: "must have required property '" + "dander_version" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(key0 === "connectors" || key0 === "dander_version" || key0 === "schema_version")) {
        const err1 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
    if (data.connectors !== undefined) {
      let data0 = data.connectors;
      if (Array.isArray(data0)) {
        const len0 = data0.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data1 = data0[i0];
          if (data1 && typeof data1 == "object" && !Array.isArray(data1)) {
            if (data1.id === undefined) {
              const err2 = {
                instancePath: instancePath + "/connectors/" + i0,
                schemaPath: "#/$defs/PluginCatalogRecord/required",
                keyword: "required",
                params: { missingProperty: "id" },
                message: "must have required property '" + "id" + "'",
              };
              if (vErrors === null) {
                vErrors = [err2];
              } else {
                vErrors.push(err2);
              }
              errors++;
            }
            if (data1.display_name === undefined) {
              const err3 = {
                instancePath: instancePath + "/connectors/" + i0,
                schemaPath: "#/$defs/PluginCatalogRecord/required",
                keyword: "required",
                params: { missingProperty: "display_name" },
                message: "must have required property '" + "display_name" + "'",
              };
              if (vErrors === null) {
                vErrors = [err3];
              } else {
                vErrors.push(err3);
              }
              errors++;
            }
            if (data1.description === undefined) {
              const err4 = {
                instancePath: instancePath + "/connectors/" + i0,
                schemaPath: "#/$defs/PluginCatalogRecord/required",
                keyword: "required",
                params: { missingProperty: "description" },
                message: "must have required property '" + "description" + "'",
              };
              if (vErrors === null) {
                vErrors = [err4];
              } else {
                vErrors.push(err4);
              }
              errors++;
            }
            if (data1.distribution === undefined) {
              const err5 = {
                instancePath: instancePath + "/connectors/" + i0,
                schemaPath: "#/$defs/PluginCatalogRecord/required",
                keyword: "required",
                params: { missingProperty: "distribution" },
                message: "must have required property '" + "distribution" + "'",
              };
              if (vErrors === null) {
                vErrors = [err5];
              } else {
                vErrors.push(err5);
              }
              errors++;
            }
            if (data1.version === undefined) {
              const err6 = {
                instancePath: instancePath + "/connectors/" + i0,
                schemaPath: "#/$defs/PluginCatalogRecord/required",
                keyword: "required",
                params: { missingProperty: "version" },
                message: "must have required property '" + "version" + "'",
              };
              if (vErrors === null) {
                vErrors = [err6];
              } else {
                vErrors.push(err6);
              }
              errors++;
            }
            if (data1.dander_specifier === undefined) {
              const err7 = {
                instancePath: instancePath + "/connectors/" + i0,
                schemaPath: "#/$defs/PluginCatalogRecord/required",
                keyword: "required",
                params: { missingProperty: "dander_specifier" },
                message: "must have required property '" + "dander_specifier" + "'",
              };
              if (vErrors === null) {
                vErrors = [err7];
              } else {
                vErrors.push(err7);
              }
              errors++;
            }
            if (data1.compatible === undefined) {
              const err8 = {
                instancePath: instancePath + "/connectors/" + i0,
                schemaPath: "#/$defs/PluginCatalogRecord/required",
                keyword: "required",
                params: { missingProperty: "compatible" },
                message: "must have required property '" + "compatible" + "'",
              };
              if (vErrors === null) {
                vErrors = [err8];
              } else {
                vErrors.push(err8);
              }
              errors++;
            }
            if (data1.support_status === undefined) {
              const err9 = {
                instancePath: instancePath + "/connectors/" + i0,
                schemaPath: "#/$defs/PluginCatalogRecord/required",
                keyword: "required",
                params: { missingProperty: "support_status" },
                message: "must have required property '" + "support_status" + "'",
              };
              if (vErrors === null) {
                vErrors = [err9];
              } else {
                vErrors.push(err9);
              }
              errors++;
            }
            if (data1.validation_status === undefined) {
              const err10 = {
                instancePath: instancePath + "/connectors/" + i0,
                schemaPath: "#/$defs/PluginCatalogRecord/required",
                keyword: "required",
                params: { missingProperty: "validation_status" },
                message: "must have required property '" + "validation_status" + "'",
              };
              if (vErrors === null) {
                vErrors = [err10];
              } else {
                vErrors.push(err10);
              }
              errors++;
            }
            if (data1.documentation_url === undefined) {
              const err11 = {
                instancePath: instancePath + "/connectors/" + i0,
                schemaPath: "#/$defs/PluginCatalogRecord/required",
                keyword: "required",
                params: { missingProperty: "documentation_url" },
                message: "must have required property '" + "documentation_url" + "'",
              };
              if (vErrors === null) {
                vErrors = [err11];
              } else {
                vErrors.push(err11);
              }
              errors++;
            }
            if (data1.pypi_url === undefined) {
              const err12 = {
                instancePath: instancePath + "/connectors/" + i0,
                schemaPath: "#/$defs/PluginCatalogRecord/required",
                keyword: "required",
                params: { missingProperty: "pypi_url" },
                message: "must have required property '" + "pypi_url" + "'",
              };
              if (vErrors === null) {
                vErrors = [err12];
              } else {
                vErrors.push(err12);
              }
              errors++;
            }
            if (data1.repository_url === undefined) {
              const err13 = {
                instancePath: instancePath + "/connectors/" + i0,
                schemaPath: "#/$defs/PluginCatalogRecord/required",
                keyword: "required",
                params: { missingProperty: "repository_url" },
                message: "must have required property '" + "repository_url" + "'",
              };
              if (vErrors === null) {
                vErrors = [err13];
              } else {
                vErrors.push(err13);
              }
              errors++;
            }
            if (data1.installed === undefined) {
              const err14 = {
                instancePath: instancePath + "/connectors/" + i0,
                schemaPath: "#/$defs/PluginCatalogRecord/required",
                keyword: "required",
                params: { missingProperty: "installed" },
                message: "must have required property '" + "installed" + "'",
              };
              if (vErrors === null) {
                vErrors = [err14];
              } else {
                vErrors.push(err14);
              }
              errors++;
            }
            for (const key1 in data1) {
              if (!func2.call(schema127.properties, key1)) {
                const err15 = {
                  instancePath: instancePath + "/connectors/" + i0,
                  schemaPath: "#/$defs/PluginCatalogRecord/additionalProperties",
                  keyword: "additionalProperties",
                  params: { additionalProperty: key1 },
                  message: "must NOT have additional properties",
                };
                if (vErrors === null) {
                  vErrors = [err15];
                } else {
                  vErrors.push(err15);
                }
                errors++;
              }
            }
            if (data1.compatible !== undefined) {
              if (typeof data1.compatible !== "boolean") {
                const err16 = {
                  instancePath: instancePath + "/connectors/" + i0 + "/compatible",
                  schemaPath: "#/$defs/PluginCatalogRecord/properties/compatible/type",
                  keyword: "type",
                  params: { type: "boolean" },
                  message: "must be boolean",
                };
                if (vErrors === null) {
                  vErrors = [err16];
                } else {
                  vErrors.push(err16);
                }
                errors++;
              }
            }
            if (data1.dander_specifier !== undefined) {
              if (typeof data1.dander_specifier !== "string") {
                const err17 = {
                  instancePath: instancePath + "/connectors/" + i0 + "/dander_specifier",
                  schemaPath: "#/$defs/PluginCatalogRecord/properties/dander_specifier/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string",
                };
                if (vErrors === null) {
                  vErrors = [err17];
                } else {
                  vErrors.push(err17);
                }
                errors++;
              }
            }
            if (data1.description !== undefined) {
              if (typeof data1.description !== "string") {
                const err18 = {
                  instancePath: instancePath + "/connectors/" + i0 + "/description",
                  schemaPath: "#/$defs/PluginCatalogRecord/properties/description/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string",
                };
                if (vErrors === null) {
                  vErrors = [err18];
                } else {
                  vErrors.push(err18);
                }
                errors++;
              }
            }
            if (data1.display_name !== undefined) {
              if (typeof data1.display_name !== "string") {
                const err19 = {
                  instancePath: instancePath + "/connectors/" + i0 + "/display_name",
                  schemaPath: "#/$defs/PluginCatalogRecord/properties/display_name/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string",
                };
                if (vErrors === null) {
                  vErrors = [err19];
                } else {
                  vErrors.push(err19);
                }
                errors++;
              }
            }
            if (data1.distribution !== undefined) {
              if (typeof data1.distribution !== "string") {
                const err20 = {
                  instancePath: instancePath + "/connectors/" + i0 + "/distribution",
                  schemaPath: "#/$defs/PluginCatalogRecord/properties/distribution/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string",
                };
                if (vErrors === null) {
                  vErrors = [err20];
                } else {
                  vErrors.push(err20);
                }
                errors++;
              }
            }
            if (data1.documentation_url !== undefined) {
              if (typeof data1.documentation_url !== "string") {
                const err21 = {
                  instancePath: instancePath + "/connectors/" + i0 + "/documentation_url",
                  schemaPath: "#/$defs/PluginCatalogRecord/properties/documentation_url/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string",
                };
                if (vErrors === null) {
                  vErrors = [err21];
                } else {
                  vErrors.push(err21);
                }
                errors++;
              }
            }
            if (data1.id !== undefined) {
              if (typeof data1.id !== "string") {
                const err22 = {
                  instancePath: instancePath + "/connectors/" + i0 + "/id",
                  schemaPath: "#/$defs/PluginCatalogRecord/properties/id/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string",
                };
                if (vErrors === null) {
                  vErrors = [err22];
                } else {
                  vErrors.push(err22);
                }
                errors++;
              }
            }
            if (data1.installed !== undefined) {
              if (typeof data1.installed !== "boolean") {
                const err23 = {
                  instancePath: instancePath + "/connectors/" + i0 + "/installed",
                  schemaPath: "#/$defs/PluginCatalogRecord/properties/installed/type",
                  keyword: "type",
                  params: { type: "boolean" },
                  message: "must be boolean",
                };
                if (vErrors === null) {
                  vErrors = [err23];
                } else {
                  vErrors.push(err23);
                }
                errors++;
              }
            }
            if (data1.installed_version !== undefined) {
              let data10 = data1.installed_version;
              const _errs25 = errors;
              let valid5 = false;
              const _errs26 = errors;
              if (typeof data10 !== "string") {
                const err24 = {
                  instancePath: instancePath + "/connectors/" + i0 + "/installed_version",
                  schemaPath:
                    "#/$defs/PluginCatalogRecord/properties/installed_version/anyOf/0/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string",
                };
                if (vErrors === null) {
                  vErrors = [err24];
                } else {
                  vErrors.push(err24);
                }
                errors++;
              }
              var _valid0 = _errs26 === errors;
              valid5 = valid5 || _valid0;
              const _errs28 = errors;
              if (data10 !== null) {
                const err25 = {
                  instancePath: instancePath + "/connectors/" + i0 + "/installed_version",
                  schemaPath:
                    "#/$defs/PluginCatalogRecord/properties/installed_version/anyOf/1/type",
                  keyword: "type",
                  params: { type: "null" },
                  message: "must be null",
                };
                if (vErrors === null) {
                  vErrors = [err25];
                } else {
                  vErrors.push(err25);
                }
                errors++;
              }
              var _valid0 = _errs28 === errors;
              valid5 = valid5 || _valid0;
              if (!valid5) {
                const err26 = {
                  instancePath: instancePath + "/connectors/" + i0 + "/installed_version",
                  schemaPath: "#/$defs/PluginCatalogRecord/properties/installed_version/anyOf",
                  keyword: "anyOf",
                  params: {},
                  message: "must match a schema in anyOf",
                };
                if (vErrors === null) {
                  vErrors = [err26];
                } else {
                  vErrors.push(err26);
                }
                errors++;
              } else {
                errors = _errs25;
                if (vErrors !== null) {
                  if (_errs25) {
                    vErrors.length = _errs25;
                  } else {
                    vErrors = null;
                  }
                }
              }
            }
            if (data1.pypi_url !== undefined) {
              if (typeof data1.pypi_url !== "string") {
                const err27 = {
                  instancePath: instancePath + "/connectors/" + i0 + "/pypi_url",
                  schemaPath: "#/$defs/PluginCatalogRecord/properties/pypi_url/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string",
                };
                if (vErrors === null) {
                  vErrors = [err27];
                } else {
                  vErrors.push(err27);
                }
                errors++;
              }
            }
            if (data1.repository_url !== undefined) {
              if (typeof data1.repository_url !== "string") {
                const err28 = {
                  instancePath: instancePath + "/connectors/" + i0 + "/repository_url",
                  schemaPath: "#/$defs/PluginCatalogRecord/properties/repository_url/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string",
                };
                if (vErrors === null) {
                  vErrors = [err28];
                } else {
                  vErrors.push(err28);
                }
                errors++;
              }
            }
            if (data1.support_status !== undefined) {
              if (typeof data1.support_status !== "string") {
                const err29 = {
                  instancePath: instancePath + "/connectors/" + i0 + "/support_status",
                  schemaPath: "#/$defs/PluginCatalogRecord/properties/support_status/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string",
                };
                if (vErrors === null) {
                  vErrors = [err29];
                } else {
                  vErrors.push(err29);
                }
                errors++;
              }
            }
            if (data1.validation_status !== undefined) {
              if (typeof data1.validation_status !== "string") {
                const err30 = {
                  instancePath: instancePath + "/connectors/" + i0 + "/validation_status",
                  schemaPath: "#/$defs/PluginCatalogRecord/properties/validation_status/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string",
                };
                if (vErrors === null) {
                  vErrors = [err30];
                } else {
                  vErrors.push(err30);
                }
                errors++;
              }
            }
            if (data1.version !== undefined) {
              if (typeof data1.version !== "string") {
                const err31 = {
                  instancePath: instancePath + "/connectors/" + i0 + "/version",
                  schemaPath: "#/$defs/PluginCatalogRecord/properties/version/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string",
                };
                if (vErrors === null) {
                  vErrors = [err31];
                } else {
                  vErrors.push(err31);
                }
                errors++;
              }
            }
          } else {
            const err32 = {
              instancePath: instancePath + "/connectors/" + i0,
              schemaPath: "#/$defs/PluginCatalogRecord/type",
              keyword: "type",
              params: { type: "object" },
              message: "must be object",
            };
            if (vErrors === null) {
              vErrors = [err32];
            } else {
              vErrors.push(err32);
            }
            errors++;
          }
        }
      } else {
        const err33 = {
          instancePath: instancePath + "/connectors",
          schemaPath: "#/properties/connectors/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array",
        };
        if (vErrors === null) {
          vErrors = [err33];
        } else {
          vErrors.push(err33);
        }
        errors++;
      }
    }
    if (data.dander_version !== undefined) {
      if (typeof data.dander_version !== "string") {
        const err34 = {
          instancePath: instancePath + "/dander_version",
          schemaPath: "#/properties/dander_version/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err34];
        } else {
          vErrors.push(err34);
        }
        errors++;
      }
    }
    if (data.schema_version !== undefined) {
      let data17 = data.schema_version;
      if (!(typeof data17 == "number" && !(data17 % 1) && !isNaN(data17) && isFinite(data17))) {
        const err35 = {
          instancePath: instancePath + "/schema_version",
          schemaPath: "#/properties/schema_version/type",
          keyword: "type",
          params: { type: "integer" },
          message: "must be integer",
        };
        if (vErrors === null) {
          vErrors = [err35];
        } else {
          vErrors.push(err35);
        }
        errors++;
      }
      if (1 !== data17) {
        const err36 = {
          instancePath: instancePath + "/schema_version",
          schemaPath: "#/properties/schema_version/const",
          keyword: "const",
          params: { allowedValue: 1 },
          message: "must be equal to constant",
        };
        if (vErrors === null) {
          vErrors = [err36];
        } else {
          vErrors.push(err36);
        }
        errors++;
      }
    }
  } else {
    const err37 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err37];
    } else {
      vErrors.push(err37);
    }
    errors++;
  }
  validate161.errors = vErrors;
  return errors === 0;
}
validate161.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

export const validateRunRequest = validate162;
const schema128 = {
  $id: "urn:dander:control:contracts:v1:run-request",
  $schema: "https://json-schema.org/draft/2020-12/schema",
  additionalProperties: false,
  properties: {
    expected_revision: { title: "Expected Revision", type: "string" },
    idempotency_key: { maxLength: 128, minLength: 1, title: "Idempotency Key", type: "string" },
  },
  required: ["expected_revision", "idempotency_key"],
  title: "RunRequest",
  type: "object",
};

function validate162(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="urn:dander:control:contracts:v1:run-request" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate162.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.expected_revision === undefined) {
      const err0 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "expected_revision" },
        message: "must have required property '" + "expected_revision" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.idempotency_key === undefined) {
      const err1 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "idempotency_key" },
        message: "must have required property '" + "idempotency_key" + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(key0 === "expected_revision" || key0 === "idempotency_key")) {
        const err2 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.expected_revision !== undefined) {
      if (typeof data.expected_revision !== "string") {
        const err3 = {
          instancePath: instancePath + "/expected_revision",
          schemaPath: "#/properties/expected_revision/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.idempotency_key !== undefined) {
      let data1 = data.idempotency_key;
      if (typeof data1 === "string") {
        if (func1(data1) > 128) {
          const err4 = {
            instancePath: instancePath + "/idempotency_key",
            schemaPath: "#/properties/idempotency_key/maxLength",
            keyword: "maxLength",
            params: { limit: 128 },
            message: "must NOT have more than 128 characters",
          };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
        if (func1(data1) < 1) {
          const err5 = {
            instancePath: instancePath + "/idempotency_key",
            schemaPath: "#/properties/idempotency_key/minLength",
            keyword: "minLength",
            params: { limit: 1 },
            message: "must NOT have fewer than 1 characters",
          };
          if (vErrors === null) {
            vErrors = [err5];
          } else {
            vErrors.push(err5);
          }
          errors++;
        }
      } else {
        const err6 = {
          instancePath: instancePath + "/idempotency_key",
          schemaPath: "#/properties/idempotency_key/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
  } else {
    const err7 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err7];
    } else {
      vErrors.push(err7);
    }
    errors++;
  }
  validate162.errors = vErrors;
  return errors === 0;
}
validate162.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

export const validateRunStatus = validate163;
const schema129 = {
  $defs: {
    RunState: {
      enum: ["queued", "running", "succeeded", "failed", "canceling", "canceled", "retrying"],
      title: "RunState",
      type: "string",
    },
  },
  $id: "urn:dander:control:contracts:v1:run-status",
  $schema: "https://json-schema.org/draft/2020-12/schema",
  additionalProperties: false,
  properties: {
    affected: { default: 0, minimum: 0, title: "Affected", type: "integer" },
    assertions: { default: 0, minimum: 0, title: "Assertions", type: "integer" },
    assets: { default: 0, minimum: 0, title: "Assets", type: "integer" },
    can_cancel: { default: false, title: "Can Cancel", type: "boolean" },
    can_replay: { default: false, title: "Can Replay", type: "boolean" },
    endpoints: { default: 0, minimum: 0, title: "Endpoints", type: "integer" },
    extracted: { default: 0, minimum: 0, title: "Extracted", type: "integer" },
    failure_code: {
      anyOf: [{ type: "string" }, { type: "null" }],
      default: null,
      title: "Failure Code",
    },
    failure_summary: {
      anyOf: [{ type: "string" }, { type: "null" }],
      default: null,
      title: "Failure Summary",
    },
    finished_at: {
      anyOf: [{ type: "string" }, { type: "null" }],
      default: null,
      title: "Finished At",
    },
    logs_available: { default: false, title: "Logs Available", type: "boolean" },
    models: { default: 0, minimum: 0, title: "Models", type: "integer" },
    run_id: { title: "Run Id", type: "string" },
    stage: { anyOf: [{ type: "string" }, { type: "null" }], default: null, title: "Stage" },
    started_at: {
      anyOf: [{ type: "string" }, { type: "null" }],
      default: null,
      title: "Started At",
    },
    state: { $ref: "#/$defs/RunState" },
  },
  required: ["run_id", "state"],
  title: "RunStatusResponse",
  type: "object",
};
const schema130 = {
  enum: ["queued", "running", "succeeded", "failed", "canceling", "canceled", "retrying"],
  title: "RunState",
  type: "string",
};

function validate163(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="urn:dander:control:contracts:v1:run-status" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate163.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.run_id === undefined) {
      const err0 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "run_id" },
        message: "must have required property '" + "run_id" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.state === undefined) {
      const err1 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "state" },
        message: "must have required property '" + "state" + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!func2.call(schema129.properties, key0)) {
        const err2 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.affected !== undefined) {
      let data0 = data.affected;
      if (!(typeof data0 == "number" && !(data0 % 1) && !isNaN(data0) && isFinite(data0))) {
        const err3 = {
          instancePath: instancePath + "/affected",
          schemaPath: "#/properties/affected/type",
          keyword: "type",
          params: { type: "integer" },
          message: "must be integer",
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
      if (typeof data0 == "number" && isFinite(data0)) {
        if (data0 < 0 || isNaN(data0)) {
          const err4 = {
            instancePath: instancePath + "/affected",
            schemaPath: "#/properties/affected/minimum",
            keyword: "minimum",
            params: { comparison: ">=", limit: 0 },
            message: "must be >= 0",
          };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
      }
    }
    if (data.assertions !== undefined) {
      let data1 = data.assertions;
      if (!(typeof data1 == "number" && !(data1 % 1) && !isNaN(data1) && isFinite(data1))) {
        const err5 = {
          instancePath: instancePath + "/assertions",
          schemaPath: "#/properties/assertions/type",
          keyword: "type",
          params: { type: "integer" },
          message: "must be integer",
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
      if (typeof data1 == "number" && isFinite(data1)) {
        if (data1 < 0 || isNaN(data1)) {
          const err6 = {
            instancePath: instancePath + "/assertions",
            schemaPath: "#/properties/assertions/minimum",
            keyword: "minimum",
            params: { comparison: ">=", limit: 0 },
            message: "must be >= 0",
          };
          if (vErrors === null) {
            vErrors = [err6];
          } else {
            vErrors.push(err6);
          }
          errors++;
        }
      }
    }
    if (data.assets !== undefined) {
      let data2 = data.assets;
      if (!(typeof data2 == "number" && !(data2 % 1) && !isNaN(data2) && isFinite(data2))) {
        const err7 = {
          instancePath: instancePath + "/assets",
          schemaPath: "#/properties/assets/type",
          keyword: "type",
          params: { type: "integer" },
          message: "must be integer",
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
      if (typeof data2 == "number" && isFinite(data2)) {
        if (data2 < 0 || isNaN(data2)) {
          const err8 = {
            instancePath: instancePath + "/assets",
            schemaPath: "#/properties/assets/minimum",
            keyword: "minimum",
            params: { comparison: ">=", limit: 0 },
            message: "must be >= 0",
          };
          if (vErrors === null) {
            vErrors = [err8];
          } else {
            vErrors.push(err8);
          }
          errors++;
        }
      }
    }
    if (data.can_cancel !== undefined) {
      if (typeof data.can_cancel !== "boolean") {
        const err9 = {
          instancePath: instancePath + "/can_cancel",
          schemaPath: "#/properties/can_cancel/type",
          keyword: "type",
          params: { type: "boolean" },
          message: "must be boolean",
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
    if (data.can_replay !== undefined) {
      if (typeof data.can_replay !== "boolean") {
        const err10 = {
          instancePath: instancePath + "/can_replay",
          schemaPath: "#/properties/can_replay/type",
          keyword: "type",
          params: { type: "boolean" },
          message: "must be boolean",
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.endpoints !== undefined) {
      let data5 = data.endpoints;
      if (!(typeof data5 == "number" && !(data5 % 1) && !isNaN(data5) && isFinite(data5))) {
        const err11 = {
          instancePath: instancePath + "/endpoints",
          schemaPath: "#/properties/endpoints/type",
          keyword: "type",
          params: { type: "integer" },
          message: "must be integer",
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
      if (typeof data5 == "number" && isFinite(data5)) {
        if (data5 < 0 || isNaN(data5)) {
          const err12 = {
            instancePath: instancePath + "/endpoints",
            schemaPath: "#/properties/endpoints/minimum",
            keyword: "minimum",
            params: { comparison: ">=", limit: 0 },
            message: "must be >= 0",
          };
          if (vErrors === null) {
            vErrors = [err12];
          } else {
            vErrors.push(err12);
          }
          errors++;
        }
      }
    }
    if (data.extracted !== undefined) {
      let data6 = data.extracted;
      if (!(typeof data6 == "number" && !(data6 % 1) && !isNaN(data6) && isFinite(data6))) {
        const err13 = {
          instancePath: instancePath + "/extracted",
          schemaPath: "#/properties/extracted/type",
          keyword: "type",
          params: { type: "integer" },
          message: "must be integer",
        };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
      if (typeof data6 == "number" && isFinite(data6)) {
        if (data6 < 0 || isNaN(data6)) {
          const err14 = {
            instancePath: instancePath + "/extracted",
            schemaPath: "#/properties/extracted/minimum",
            keyword: "minimum",
            params: { comparison: ">=", limit: 0 },
            message: "must be >= 0",
          };
          if (vErrors === null) {
            vErrors = [err14];
          } else {
            vErrors.push(err14);
          }
          errors++;
        }
      }
    }
    if (data.failure_code !== undefined) {
      let data7 = data.failure_code;
      const _errs17 = errors;
      let valid1 = false;
      const _errs18 = errors;
      if (typeof data7 !== "string") {
        const err15 = {
          instancePath: instancePath + "/failure_code",
          schemaPath: "#/properties/failure_code/anyOf/0/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err15];
        } else {
          vErrors.push(err15);
        }
        errors++;
      }
      var _valid0 = _errs18 === errors;
      valid1 = valid1 || _valid0;
      const _errs20 = errors;
      if (data7 !== null) {
        const err16 = {
          instancePath: instancePath + "/failure_code",
          schemaPath: "#/properties/failure_code/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err16];
        } else {
          vErrors.push(err16);
        }
        errors++;
      }
      var _valid0 = _errs20 === errors;
      valid1 = valid1 || _valid0;
      if (!valid1) {
        const err17 = {
          instancePath: instancePath + "/failure_code",
          schemaPath: "#/properties/failure_code/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err17];
        } else {
          vErrors.push(err17);
        }
        errors++;
      } else {
        errors = _errs17;
        if (vErrors !== null) {
          if (_errs17) {
            vErrors.length = _errs17;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.failure_summary !== undefined) {
      let data8 = data.failure_summary;
      const _errs23 = errors;
      let valid2 = false;
      const _errs24 = errors;
      if (typeof data8 !== "string") {
        const err18 = {
          instancePath: instancePath + "/failure_summary",
          schemaPath: "#/properties/failure_summary/anyOf/0/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err18];
        } else {
          vErrors.push(err18);
        }
        errors++;
      }
      var _valid1 = _errs24 === errors;
      valid2 = valid2 || _valid1;
      const _errs26 = errors;
      if (data8 !== null) {
        const err19 = {
          instancePath: instancePath + "/failure_summary",
          schemaPath: "#/properties/failure_summary/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err19];
        } else {
          vErrors.push(err19);
        }
        errors++;
      }
      var _valid1 = _errs26 === errors;
      valid2 = valid2 || _valid1;
      if (!valid2) {
        const err20 = {
          instancePath: instancePath + "/failure_summary",
          schemaPath: "#/properties/failure_summary/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      } else {
        errors = _errs23;
        if (vErrors !== null) {
          if (_errs23) {
            vErrors.length = _errs23;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.finished_at !== undefined) {
      let data9 = data.finished_at;
      const _errs29 = errors;
      let valid3 = false;
      const _errs30 = errors;
      if (typeof data9 !== "string") {
        const err21 = {
          instancePath: instancePath + "/finished_at",
          schemaPath: "#/properties/finished_at/anyOf/0/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err21];
        } else {
          vErrors.push(err21);
        }
        errors++;
      }
      var _valid2 = _errs30 === errors;
      valid3 = valid3 || _valid2;
      const _errs32 = errors;
      if (data9 !== null) {
        const err22 = {
          instancePath: instancePath + "/finished_at",
          schemaPath: "#/properties/finished_at/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
      var _valid2 = _errs32 === errors;
      valid3 = valid3 || _valid2;
      if (!valid3) {
        const err23 = {
          instancePath: instancePath + "/finished_at",
          schemaPath: "#/properties/finished_at/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      } else {
        errors = _errs29;
        if (vErrors !== null) {
          if (_errs29) {
            vErrors.length = _errs29;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.logs_available !== undefined) {
      if (typeof data.logs_available !== "boolean") {
        const err24 = {
          instancePath: instancePath + "/logs_available",
          schemaPath: "#/properties/logs_available/type",
          keyword: "type",
          params: { type: "boolean" },
          message: "must be boolean",
        };
        if (vErrors === null) {
          vErrors = [err24];
        } else {
          vErrors.push(err24);
        }
        errors++;
      }
    }
    if (data.models !== undefined) {
      let data11 = data.models;
      if (!(typeof data11 == "number" && !(data11 % 1) && !isNaN(data11) && isFinite(data11))) {
        const err25 = {
          instancePath: instancePath + "/models",
          schemaPath: "#/properties/models/type",
          keyword: "type",
          params: { type: "integer" },
          message: "must be integer",
        };
        if (vErrors === null) {
          vErrors = [err25];
        } else {
          vErrors.push(err25);
        }
        errors++;
      }
      if (typeof data11 == "number" && isFinite(data11)) {
        if (data11 < 0 || isNaN(data11)) {
          const err26 = {
            instancePath: instancePath + "/models",
            schemaPath: "#/properties/models/minimum",
            keyword: "minimum",
            params: { comparison: ">=", limit: 0 },
            message: "must be >= 0",
          };
          if (vErrors === null) {
            vErrors = [err26];
          } else {
            vErrors.push(err26);
          }
          errors++;
        }
      }
    }
    if (data.run_id !== undefined) {
      if (typeof data.run_id !== "string") {
        const err27 = {
          instancePath: instancePath + "/run_id",
          schemaPath: "#/properties/run_id/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err27];
        } else {
          vErrors.push(err27);
        }
        errors++;
      }
    }
    if (data.stage !== undefined) {
      let data13 = data.stage;
      const _errs41 = errors;
      let valid4 = false;
      const _errs42 = errors;
      if (typeof data13 !== "string") {
        const err28 = {
          instancePath: instancePath + "/stage",
          schemaPath: "#/properties/stage/anyOf/0/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err28];
        } else {
          vErrors.push(err28);
        }
        errors++;
      }
      var _valid3 = _errs42 === errors;
      valid4 = valid4 || _valid3;
      const _errs44 = errors;
      if (data13 !== null) {
        const err29 = {
          instancePath: instancePath + "/stage",
          schemaPath: "#/properties/stage/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err29];
        } else {
          vErrors.push(err29);
        }
        errors++;
      }
      var _valid3 = _errs44 === errors;
      valid4 = valid4 || _valid3;
      if (!valid4) {
        const err30 = {
          instancePath: instancePath + "/stage",
          schemaPath: "#/properties/stage/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err30];
        } else {
          vErrors.push(err30);
        }
        errors++;
      } else {
        errors = _errs41;
        if (vErrors !== null) {
          if (_errs41) {
            vErrors.length = _errs41;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.started_at !== undefined) {
      let data14 = data.started_at;
      const _errs47 = errors;
      let valid5 = false;
      const _errs48 = errors;
      if (typeof data14 !== "string") {
        const err31 = {
          instancePath: instancePath + "/started_at",
          schemaPath: "#/properties/started_at/anyOf/0/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err31];
        } else {
          vErrors.push(err31);
        }
        errors++;
      }
      var _valid4 = _errs48 === errors;
      valid5 = valid5 || _valid4;
      const _errs50 = errors;
      if (data14 !== null) {
        const err32 = {
          instancePath: instancePath + "/started_at",
          schemaPath: "#/properties/started_at/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err32];
        } else {
          vErrors.push(err32);
        }
        errors++;
      }
      var _valid4 = _errs50 === errors;
      valid5 = valid5 || _valid4;
      if (!valid5) {
        const err33 = {
          instancePath: instancePath + "/started_at",
          schemaPath: "#/properties/started_at/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err33];
        } else {
          vErrors.push(err33);
        }
        errors++;
      } else {
        errors = _errs47;
        if (vErrors !== null) {
          if (_errs47) {
            vErrors.length = _errs47;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.state !== undefined) {
      let data15 = data.state;
      if (typeof data15 !== "string") {
        const err34 = {
          instancePath: instancePath + "/state",
          schemaPath: "#/$defs/RunState/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err34];
        } else {
          vErrors.push(err34);
        }
        errors++;
      }
      if (!(
        data15 === "queued" ||
        data15 === "running" ||
        data15 === "succeeded" ||
        data15 === "failed" ||
        data15 === "canceling" ||
        data15 === "canceled" ||
        data15 === "retrying"
      )) {
        const err35 = {
          instancePath: instancePath + "/state",
          schemaPath: "#/$defs/RunState/enum",
          keyword: "enum",
          params: { allowedValues: schema130.enum },
          message: "must be equal to one of the allowed values",
        };
        if (vErrors === null) {
          vErrors = [err35];
        } else {
          vErrors.push(err35);
        }
        errors++;
      }
    }
  } else {
    const err36 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err36];
    } else {
      vErrors.push(err36);
    }
    errors++;
  }
  validate163.errors = vErrors;
  return errors === 0;
}
validate163.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

export const validatePipelineNode = validate164;
const schema131 = {
  $id: "urn:druff:generated:GraphNodeDocument",
  $ref: "urn:dander:control:contracts:v1:pipeline-graph#/$defs/GraphNodeDocument",
};

function validate165(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate165.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  const _errs0 = errors;
  let valid0 = false;
  const _errs1 = errors;
  if (
    !validate67(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate67.errors : vErrors.concat(validate67.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = true;
  }
  const _errs2 = errors;
  if (
    !validate109(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate109.errors : vErrors.concat(validate109.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = true;
    }
  }
  const _errs3 = errors;
  if (
    !validate138(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate138.errors : vErrors.concat(validate138.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs3 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = true;
    }
  }
  const _errs4 = errors;
  if (
    !validate151(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate151.errors : vErrors.concat(validate151.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs4 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = true;
    }
  }
  if (!valid0) {
    const err0 = {
      instancePath,
      schemaPath: "#/anyOf",
      keyword: "anyOf",
      params: {},
      message: "must match a schema in anyOf",
    };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate165.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate165.evaluated = { dynamicProps: true, dynamicItems: false };

function validate164(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="urn:druff:generated:GraphNodeDocument" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate164.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate165(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate165.errors : vErrors.concat(validate165.errors);
    errors = vErrors.length;
  } else {
    var props0 = validate165.evaluated.props;
  }
  validate164.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate164.evaluated = { dynamicProps: true, dynamicItems: false };

export const validateNodeField = validate171;
const schema133 = {
  $id: "urn:druff:generated:NodeFieldDocument",
  $ref: "urn:dander:control:contracts:v1:pipeline-graph#/$defs/NodeFieldDocument",
};

function validate172(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate172.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.name === undefined) {
      const err0 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "name" },
        message: "must have required property '" + "name" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.type === undefined) {
      const err1 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "type" },
        message: "must have required property '" + "type" + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(
        key0 === "cast_to" ||
        key0 === "description" ||
        key0 === "extensions" ||
        key0 === "metadata" ||
        key0 === "name" ||
        key0 === "nullable" ||
        key0 === "tests" ||
        key0 === "type"
      )) {
        const err2 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.cast_to !== undefined) {
      let data0 = data.cast_to;
      const _errs3 = errors;
      let valid1 = false;
      const _errs4 = errors;
      if (typeof data0 !== "string") {
        const err3 = {
          instancePath: instancePath + "/cast_to",
          schemaPath: "#/properties/cast_to/anyOf/0/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
      var _valid0 = _errs4 === errors;
      valid1 = valid1 || _valid0;
      const _errs6 = errors;
      if (data0 !== null) {
        const err4 = {
          instancePath: instancePath + "/cast_to",
          schemaPath: "#/properties/cast_to/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
      var _valid0 = _errs6 === errors;
      valid1 = valid1 || _valid0;
      if (!valid1) {
        const err5 = {
          instancePath: instancePath + "/cast_to",
          schemaPath: "#/properties/cast_to/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      } else {
        errors = _errs3;
        if (vErrors !== null) {
          if (_errs3) {
            vErrors.length = _errs3;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.description !== undefined) {
      let data1 = data.description;
      const _errs9 = errors;
      let valid2 = false;
      const _errs10 = errors;
      if (typeof data1 !== "string") {
        const err6 = {
          instancePath: instancePath + "/description",
          schemaPath: "#/properties/description/anyOf/0/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
      var _valid1 = _errs10 === errors;
      valid2 = valid2 || _valid1;
      const _errs12 = errors;
      if (data1 !== null) {
        const err7 = {
          instancePath: instancePath + "/description",
          schemaPath: "#/properties/description/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
      var _valid1 = _errs12 === errors;
      valid2 = valid2 || _valid1;
      if (!valid2) {
        const err8 = {
          instancePath: instancePath + "/description",
          schemaPath: "#/properties/description/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      } else {
        errors = _errs9;
        if (vErrors !== null) {
          if (_errs9) {
            vErrors.length = _errs9;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.extensions !== undefined) {
      let data2 = data.extensions;
      if (Array.isArray(data2)) {
        const len0 = data2.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data3 = data2[i0];
          if (data3 && typeof data3 == "object" && !Array.isArray(data3)) {
            if (data3.provider === undefined) {
              const err9 = {
                instancePath: instancePath + "/extensions/" + i0,
                schemaPath: "#/$defs/ProviderExtension/required",
                keyword: "required",
                params: { missingProperty: "provider" },
                message: "must have required property '" + "provider" + "'",
              };
              if (vErrors === null) {
                vErrors = [err9];
              } else {
                vErrors.push(err9);
              }
              errors++;
            }
            if (data3.name === undefined) {
              const err10 = {
                instancePath: instancePath + "/extensions/" + i0,
                schemaPath: "#/$defs/ProviderExtension/required",
                keyword: "required",
                params: { missingProperty: "name" },
                message: "must have required property '" + "name" + "'",
              };
              if (vErrors === null) {
                vErrors = [err10];
              } else {
                vErrors.push(err10);
              }
              errors++;
            }
            if (data3.value === undefined) {
              const err11 = {
                instancePath: instancePath + "/extensions/" + i0,
                schemaPath: "#/$defs/ProviderExtension/required",
                keyword: "required",
                params: { missingProperty: "value" },
                message: "must have required property '" + "value" + "'",
              };
              if (vErrors === null) {
                vErrors = [err11];
              } else {
                vErrors.push(err11);
              }
              errors++;
            }
            for (const key1 in data3) {
              if (!(key1 === "name" || key1 === "provider" || key1 === "value")) {
                const err12 = {
                  instancePath: instancePath + "/extensions/" + i0,
                  schemaPath: "#/$defs/ProviderExtension/additionalProperties",
                  keyword: "additionalProperties",
                  params: { additionalProperty: key1 },
                  message: "must NOT have additional properties",
                };
                if (vErrors === null) {
                  vErrors = [err12];
                } else {
                  vErrors.push(err12);
                }
                errors++;
              }
            }
            if (data3.name !== undefined) {
              if (typeof data3.name !== "string") {
                const err13 = {
                  instancePath: instancePath + "/extensions/" + i0 + "/name",
                  schemaPath: "#/$defs/ProviderExtension/properties/name/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string",
                };
                if (vErrors === null) {
                  vErrors = [err13];
                } else {
                  vErrors.push(err13);
                }
                errors++;
              }
            }
            if (data3.provider !== undefined) {
              if (typeof data3.provider !== "string") {
                const err14 = {
                  instancePath: instancePath + "/extensions/" + i0 + "/provider",
                  schemaPath: "#/$defs/ProviderExtension/properties/provider/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string",
                };
                if (vErrors === null) {
                  vErrors = [err14];
                } else {
                  vErrors.push(err14);
                }
                errors++;
              }
            }
            if (data3.value !== undefined) {
              let data6 = data3.value;
              const _errs25 = errors;
              let valid7 = false;
              const _errs26 = errors;
              if (typeof data6 !== "string") {
                const err15 = {
                  instancePath: instancePath + "/extensions/" + i0 + "/value",
                  schemaPath: "#/$defs/ProviderExtension/properties/value/anyOf/0/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string",
                };
                if (vErrors === null) {
                  vErrors = [err15];
                } else {
                  vErrors.push(err15);
                }
                errors++;
              }
              var _valid2 = _errs26 === errors;
              valid7 = valid7 || _valid2;
              const _errs28 = errors;
              if (!(typeof data6 == "number" && !(data6 % 1) && !isNaN(data6) && isFinite(data6))) {
                const err16 = {
                  instancePath: instancePath + "/extensions/" + i0 + "/value",
                  schemaPath: "#/$defs/ProviderExtension/properties/value/anyOf/1/type",
                  keyword: "type",
                  params: { type: "integer" },
                  message: "must be integer",
                };
                if (vErrors === null) {
                  vErrors = [err16];
                } else {
                  vErrors.push(err16);
                }
                errors++;
              }
              var _valid2 = _errs28 === errors;
              valid7 = valid7 || _valid2;
              const _errs30 = errors;
              if (!(typeof data6 == "number" && isFinite(data6))) {
                const err17 = {
                  instancePath: instancePath + "/extensions/" + i0 + "/value",
                  schemaPath: "#/$defs/ProviderExtension/properties/value/anyOf/2/type",
                  keyword: "type",
                  params: { type: "number" },
                  message: "must be number",
                };
                if (vErrors === null) {
                  vErrors = [err17];
                } else {
                  vErrors.push(err17);
                }
                errors++;
              }
              var _valid2 = _errs30 === errors;
              valid7 = valid7 || _valid2;
              const _errs32 = errors;
              if (typeof data6 !== "boolean") {
                const err18 = {
                  instancePath: instancePath + "/extensions/" + i0 + "/value",
                  schemaPath: "#/$defs/ProviderExtension/properties/value/anyOf/3/type",
                  keyword: "type",
                  params: { type: "boolean" },
                  message: "must be boolean",
                };
                if (vErrors === null) {
                  vErrors = [err18];
                } else {
                  vErrors.push(err18);
                }
                errors++;
              }
              var _valid2 = _errs32 === errors;
              valid7 = valid7 || _valid2;
              if (!valid7) {
                const err19 = {
                  instancePath: instancePath + "/extensions/" + i0 + "/value",
                  schemaPath: "#/$defs/ProviderExtension/properties/value/anyOf",
                  keyword: "anyOf",
                  params: {},
                  message: "must match a schema in anyOf",
                };
                if (vErrors === null) {
                  vErrors = [err19];
                } else {
                  vErrors.push(err19);
                }
                errors++;
              } else {
                errors = _errs25;
                if (vErrors !== null) {
                  if (_errs25) {
                    vErrors.length = _errs25;
                  } else {
                    vErrors = null;
                  }
                }
              }
            }
          } else {
            const err20 = {
              instancePath: instancePath + "/extensions/" + i0,
              schemaPath: "#/$defs/ProviderExtension/type",
              keyword: "type",
              params: { type: "object" },
              message: "must be object",
            };
            if (vErrors === null) {
              vErrors = [err20];
            } else {
              vErrors.push(err20);
            }
            errors++;
          }
        }
      } else {
        const err21 = {
          instancePath: instancePath + "/extensions",
          schemaPath: "#/properties/extensions/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array",
        };
        if (vErrors === null) {
          vErrors = [err21];
        } else {
          vErrors.push(err21);
        }
        errors++;
      }
    }
    if (data.metadata !== undefined) {
      if (
        !validate43(data.metadata, {
          instancePath: instancePath + "/metadata",
          parentData: data,
          parentDataProperty: "metadata",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate43.errors : vErrors.concat(validate43.errors);
        errors = vErrors.length;
      }
    }
    if (data.name !== undefined) {
      if (typeof data.name !== "string") {
        const err22 = {
          instancePath: instancePath + "/name",
          schemaPath: "#/properties/name/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
    }
    if (data.nullable !== undefined) {
      if (typeof data.nullable !== "boolean") {
        const err23 = {
          instancePath: instancePath + "/nullable",
          schemaPath: "#/properties/nullable/type",
          keyword: "type",
          params: { type: "boolean" },
          message: "must be boolean",
        };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      }
    }
    if (data.tests !== undefined) {
      let data10 = data.tests;
      if (Array.isArray(data10)) {
        const len1 = data10.length;
        for (let i1 = 0; i1 < len1; i1++) {
          if (
            !validate79(data10[i1], {
              instancePath: instancePath + "/tests/" + i1,
              parentData: data10,
              parentDataProperty: i1,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors = vErrors === null ? validate79.errors : vErrors.concat(validate79.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err24 = {
          instancePath: instancePath + "/tests",
          schemaPath: "#/properties/tests/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array",
        };
        if (vErrors === null) {
          vErrors = [err24];
        } else {
          vErrors.push(err24);
        }
        errors++;
      }
    }
    if (data.type !== undefined) {
      if (typeof data.type !== "string") {
        const err25 = {
          instancePath: instancePath + "/type",
          schemaPath: "#/properties/type/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err25];
        } else {
          vErrors.push(err25);
        }
        errors++;
      }
    }
  } else {
    const err26 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err26];
    } else {
      vErrors.push(err26);
    }
    errors++;
  }
  validate172.errors = vErrors;
  return errors === 0;
}
validate172.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

function validate171(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="urn:druff:generated:NodeFieldDocument" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate171.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate172(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate172.errors : vErrors.concat(validate172.errors);
    errors = vErrors.length;
  }
  validate171.errors = vErrors;
  return errors === 0;
}
validate171.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

export const validateFieldTest = validate176;
const schema136 = {
  $id: "urn:druff:generated:FieldTestDocument",
  $ref: "urn:dander:control:contracts:v1:pipeline-graph#/$defs/FieldTestDocument",
};

function validate177(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate177.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  const _errs0 = errors;
  let valid0 = false;
  const _errs1 = errors;
  if (
    !validate80(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate80.errors : vErrors.concat(validate80.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = true;
  }
  const _errs2 = errors;
  if (
    !validate83(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate83.errors : vErrors.concat(validate83.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = true;
    }
  }
  const _errs3 = errors;
  if (
    !validate86(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate86.errors : vErrors.concat(validate86.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs3 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = true;
    }
  }
  const _errs4 = errors;
  if (
    !validate89(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate89.errors : vErrors.concat(validate89.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs4 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = true;
    }
  }
  if (!valid0) {
    const err0 = {
      instancePath,
      schemaPath: "#/anyOf",
      keyword: "anyOf",
      params: {},
      message: "must match a schema in anyOf",
    };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate177.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate177.evaluated = { dynamicProps: true, dynamicItems: false };

function validate176(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="urn:druff:generated:FieldTestDocument" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate176.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate177(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate177.errors : vErrors.concat(validate177.errors);
    errors = vErrors.length;
  } else {
    var props0 = validate177.evaluated.props;
  }
  validate176.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate176.evaluated = { dynamicProps: true, dynamicItems: false };

export const validateCursorStrategy = validate183;
const schema138 = {
  $id: "urn:druff:generated:CursorStrategyDocument",
  $ref: "urn:dander:control:contracts:v1:pipeline-graph#/$defs/CursorStrategyDocument",
};

function validate184(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate184.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.field === undefined) {
      const err0 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "field" },
        message: "must have required property '" + "field" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.kind === undefined) {
      const err1 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "kind" },
        message: "must have required property '" + "kind" + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(key0 === "field" || key0 === "kind" || key0 === "metadata" || key0 === "params")) {
        const err2 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.field !== undefined) {
      let data0 = data.field;
      if (typeof data0 === "string") {
        if (func1(data0) < 1) {
          const err3 = {
            instancePath: instancePath + "/field",
            schemaPath: "#/properties/field/minLength",
            keyword: "minLength",
            params: { limit: 1 },
            message: "must NOT have fewer than 1 characters",
          };
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        }
      } else {
        const err4 = {
          instancePath: instancePath + "/field",
          schemaPath: "#/properties/field/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.kind !== undefined) {
      let data1 = data.kind;
      if (typeof data1 !== "string") {
        const err5 = {
          instancePath: instancePath + "/kind",
          schemaPath: "#/properties/kind/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
      if (!(data1 === "timestamp" || data1 === "sequence" || data1 === "opaque_token")) {
        const err6 = {
          instancePath: instancePath + "/kind",
          schemaPath: "#/properties/kind/enum",
          keyword: "enum",
          params: { allowedValues: schema79.properties.kind.enum },
          message: "must be equal to one of the allowed values",
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.metadata !== undefined) {
      if (
        !validate43(data.metadata, {
          instancePath: instancePath + "/metadata",
          parentData: data,
          parentDataProperty: "metadata",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate43.errors : vErrors.concat(validate43.errors);
        errors = vErrors.length;
      }
    }
    if (data.params !== undefined) {
      if (
        !validate43(data.params, {
          instancePath: instancePath + "/params",
          parentData: data,
          parentDataProperty: "params",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate43.errors : vErrors.concat(validate43.errors);
        errors = vErrors.length;
      }
    }
  } else {
    const err7 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err7];
    } else {
      vErrors.push(err7);
    }
    errors++;
  }
  validate184.errors = vErrors;
  return errors === 0;
}
validate184.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

function validate183(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="urn:druff:generated:CursorStrategyDocument" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate183.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate184(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate184.errors : vErrors.concat(validate184.errors);
    errors = vErrors.length;
  }
  validate183.errors = vErrors;
  return errors === 0;
}
validate183.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

export const validatePosition = validate188;
const schema140 = {
  $id: "urn:druff:generated:PositionDocument",
  $ref: "urn:dander:control:contracts:v1:pipeline-graph#/$defs/PositionDocument",
};

function validate188(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="urn:druff:generated:PositionDocument" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate188.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.x === undefined) {
      const err0 = {
        instancePath,
        schemaPath:
          "urn:dander:control:contracts:v1:pipeline-graph#/$defs/PositionDocument/required",
        keyword: "required",
        params: { missingProperty: "x" },
        message: "must have required property '" + "x" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.y === undefined) {
      const err1 = {
        instancePath,
        schemaPath:
          "urn:dander:control:contracts:v1:pipeline-graph#/$defs/PositionDocument/required",
        keyword: "required",
        params: { missingProperty: "y" },
        message: "must have required property '" + "y" + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(key0 === "x" || key0 === "y")) {
        const err2 = {
          instancePath,
          schemaPath:
            "urn:dander:control:contracts:v1:pipeline-graph#/$defs/PositionDocument/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.x !== undefined) {
      let data0 = data.x;
      if (!(typeof data0 == "number" && isFinite(data0))) {
        const err3 = {
          instancePath: instancePath + "/x",
          schemaPath:
            "urn:dander:control:contracts:v1:pipeline-graph#/$defs/PositionDocument/properties/x/type",
          keyword: "type",
          params: { type: "number" },
          message: "must be number",
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.y !== undefined) {
      let data1 = data.y;
      if (!(typeof data1 == "number" && isFinite(data1))) {
        const err4 = {
          instancePath: instancePath + "/y",
          schemaPath:
            "urn:dander:control:contracts:v1:pipeline-graph#/$defs/PositionDocument/properties/y/type",
          keyword: "type",
          params: { type: "number" },
          message: "must be number",
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
  } else {
    const err5 = {
      instancePath,
      schemaPath: "urn:dander:control:contracts:v1:pipeline-graph#/$defs/PositionDocument/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err5];
    } else {
      vErrors.push(err5);
    }
    errors++;
  }
  validate188.errors = vErrors;
  return errors === 0;
}
validate188.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

export const validateNodeVisual = validate189;
const schema142 = {
  $id: "urn:druff:generated:NodeVisualDocument",
  $ref: "urn:dander:control:contracts:v1:pipeline-graph#/$defs/NodeVisualDocument",
};

function validate190(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate190.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    for (const key0 in data) {
      if (!(key0 === "color" || key0 === "icon" || key0 === "position")) {
        const err0 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
    if (data.color !== undefined) {
      let data0 = data.color;
      const _errs3 = errors;
      let valid1 = false;
      const _errs4 = errors;
      if (typeof data0 !== "string") {
        const err1 = {
          instancePath: instancePath + "/color",
          schemaPath: "#/properties/color/anyOf/0/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
      var _valid0 = _errs4 === errors;
      valid1 = valid1 || _valid0;
      const _errs6 = errors;
      if (data0 !== null) {
        const err2 = {
          instancePath: instancePath + "/color",
          schemaPath: "#/properties/color/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
      var _valid0 = _errs6 === errors;
      valid1 = valid1 || _valid0;
      if (!valid1) {
        const err3 = {
          instancePath: instancePath + "/color",
          schemaPath: "#/properties/color/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      } else {
        errors = _errs3;
        if (vErrors !== null) {
          if (_errs3) {
            vErrors.length = _errs3;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.icon !== undefined) {
      let data1 = data.icon;
      const _errs9 = errors;
      let valid2 = false;
      const _errs10 = errors;
      if (typeof data1 !== "string") {
        const err4 = {
          instancePath: instancePath + "/icon",
          schemaPath: "#/properties/icon/anyOf/0/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
      var _valid1 = _errs10 === errors;
      valid2 = valid2 || _valid1;
      const _errs12 = errors;
      if (data1 !== null) {
        const err5 = {
          instancePath: instancePath + "/icon",
          schemaPath: "#/properties/icon/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
      var _valid1 = _errs12 === errors;
      valid2 = valid2 || _valid1;
      if (!valid2) {
        const err6 = {
          instancePath: instancePath + "/icon",
          schemaPath: "#/properties/icon/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      } else {
        errors = _errs9;
        if (vErrors !== null) {
          if (_errs9) {
            vErrors.length = _errs9;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.position !== undefined) {
      let data2 = data.position;
      const _errs15 = errors;
      let valid3 = false;
      const _errs16 = errors;
      if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
        if (data2.x === undefined) {
          const err7 = {
            instancePath: instancePath + "/position",
            schemaPath: "#/$defs/PositionDocument/required",
            keyword: "required",
            params: { missingProperty: "x" },
            message: "must have required property '" + "x" + "'",
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
        if (data2.y === undefined) {
          const err8 = {
            instancePath: instancePath + "/position",
            schemaPath: "#/$defs/PositionDocument/required",
            keyword: "required",
            params: { missingProperty: "y" },
            message: "must have required property '" + "y" + "'",
          };
          if (vErrors === null) {
            vErrors = [err8];
          } else {
            vErrors.push(err8);
          }
          errors++;
        }
        for (const key1 in data2) {
          if (!(key1 === "x" || key1 === "y")) {
            const err9 = {
              instancePath: instancePath + "/position",
              schemaPath: "#/$defs/PositionDocument/additionalProperties",
              keyword: "additionalProperties",
              params: { additionalProperty: key1 },
              message: "must NOT have additional properties",
            };
            if (vErrors === null) {
              vErrors = [err9];
            } else {
              vErrors.push(err9);
            }
            errors++;
          }
        }
        if (data2.x !== undefined) {
          let data3 = data2.x;
          if (!(typeof data3 == "number" && isFinite(data3))) {
            const err10 = {
              instancePath: instancePath + "/position/x",
              schemaPath: "#/$defs/PositionDocument/properties/x/type",
              keyword: "type",
              params: { type: "number" },
              message: "must be number",
            };
            if (vErrors === null) {
              vErrors = [err10];
            } else {
              vErrors.push(err10);
            }
            errors++;
          }
        }
        if (data2.y !== undefined) {
          let data4 = data2.y;
          if (!(typeof data4 == "number" && isFinite(data4))) {
            const err11 = {
              instancePath: instancePath + "/position/y",
              schemaPath: "#/$defs/PositionDocument/properties/y/type",
              keyword: "type",
              params: { type: "number" },
              message: "must be number",
            };
            if (vErrors === null) {
              vErrors = [err11];
            } else {
              vErrors.push(err11);
            }
            errors++;
          }
        }
      } else {
        const err12 = {
          instancePath: instancePath + "/position",
          schemaPath: "#/$defs/PositionDocument/type",
          keyword: "type",
          params: { type: "object" },
          message: "must be object",
        };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      }
      var _valid2 = _errs16 === errors;
      valid3 = valid3 || _valid2;
      const _errs24 = errors;
      if (data2 !== null) {
        const err13 = {
          instancePath: instancePath + "/position",
          schemaPath: "#/properties/position/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
      var _valid2 = _errs24 === errors;
      valid3 = valid3 || _valid2;
      if (!valid3) {
        const err14 = {
          instancePath: instancePath + "/position",
          schemaPath: "#/properties/position/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err14];
        } else {
          vErrors.push(err14);
        }
        errors++;
      } else {
        errors = _errs15;
        if (vErrors !== null) {
          if (_errs15) {
            vErrors.length = _errs15;
          } else {
            vErrors = null;
          }
        }
      }
    }
  } else {
    const err15 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err15];
    } else {
      vErrors.push(err15);
    }
    errors++;
  }
  validate190.errors = vErrors;
  return errors === 0;
}
validate190.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

function validate189(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="urn:druff:generated:NodeVisualDocument" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate189.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate190(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate190.errors : vErrors.concat(validate190.errors);
    errors = vErrors.length;
  }
  validate189.errors = vErrors;
  return errors === 0;
}
validate189.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

export const validateTransformation = validate192;
const schema145 = {
  $id: "urn:druff:generated:TransformationDocument",
  $ref: "urn:dander:control:contracts:v1:pipeline-graph#/$defs/TransformationDocument",
};

function validate193(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate193.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  const _errs0 = errors;
  let valid0 = false;
  const _errs1 = errors;
  if (
    !validate49(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate49.errors : vErrors.concat(validate49.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = true;
  }
  const _errs2 = errors;
  if (
    !validate52(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate52.errors : vErrors.concat(validate52.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = true;
    }
  }
  const _errs3 = errors;
  if (
    !validate55(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate55.errors : vErrors.concat(validate55.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs3 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = true;
    }
  }
  const _errs4 = errors;
  if (
    !validate58(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate58.errors : vErrors.concat(validate58.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs4 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = true;
    }
  }
  if (!valid0) {
    const err0 = {
      instancePath,
      schemaPath: "#/anyOf",
      keyword: "anyOf",
      params: {},
      message: "must match a schema in anyOf",
    };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate193.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate193.evaluated = { dynamicProps: true, dynamicItems: false };

function validate192(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="urn:druff:generated:TransformationDocument" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate192.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate193(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate193.errors : vErrors.concat(validate193.errors);
    errors = vErrors.length;
  } else {
    var props0 = validate193.evaluated.props;
  }
  validate192.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate192.evaluated = { dynamicProps: true, dynamicItems: false };

export const validateFieldMapping = validate199;
const schema147 = {
  $id: "urn:druff:generated:FieldMappingDocument",
  $ref: "urn:dander:control:contracts:v1:pipeline-graph#/$defs/FieldMappingDocument",
};

function validate200(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate200.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.target === undefined) {
      const err0 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "target" },
        message: "must have required property '" + "target" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(
        key0 === "metadata" ||
        key0 === "source" ||
        key0 === "target" ||
        key0 === "transformation"
      )) {
        const err1 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
    if (data.metadata !== undefined) {
      if (
        !validate43(data.metadata, {
          instancePath: instancePath + "/metadata",
          parentData: data,
          parentDataProperty: "metadata",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate43.errors : vErrors.concat(validate43.errors);
        errors = vErrors.length;
      }
    }
    if (data.source !== undefined) {
      let data1 = data.source;
      const _errs4 = errors;
      let valid1 = false;
      const _errs5 = errors;
      if (typeof data1 !== "string") {
        const err2 = {
          instancePath: instancePath + "/source",
          schemaPath: "#/properties/source/anyOf/0/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
      var _valid0 = _errs5 === errors;
      valid1 = valid1 || _valid0;
      const _errs7 = errors;
      if (data1 !== null) {
        const err3 = {
          instancePath: instancePath + "/source",
          schemaPath: "#/properties/source/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
      var _valid0 = _errs7 === errors;
      valid1 = valid1 || _valid0;
      if (!valid1) {
        const err4 = {
          instancePath: instancePath + "/source",
          schemaPath: "#/properties/source/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      } else {
        errors = _errs4;
        if (vErrors !== null) {
          if (_errs4) {
            vErrors.length = _errs4;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.target !== undefined) {
      if (typeof data.target !== "string") {
        const err5 = {
          instancePath: instancePath + "/target",
          schemaPath: "#/properties/target/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.transformation !== undefined) {
      let data3 = data.transformation;
      const _errs12 = errors;
      let valid2 = false;
      const _errs13 = errors;
      if (
        !validate48(data3, {
          instancePath: instancePath + "/transformation",
          parentData: data,
          parentDataProperty: "transformation",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate48.errors : vErrors.concat(validate48.errors);
        errors = vErrors.length;
      }
      var _valid1 = _errs13 === errors;
      valid2 = valid2 || _valid1;
      const _errs14 = errors;
      if (data3 !== null) {
        const err6 = {
          instancePath: instancePath + "/transformation",
          schemaPath: "#/properties/transformation/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
      var _valid1 = _errs14 === errors;
      valid2 = valid2 || _valid1;
      if (!valid2) {
        const err7 = {
          instancePath: instancePath + "/transformation",
          schemaPath: "#/properties/transformation/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      } else {
        errors = _errs12;
        if (vErrors !== null) {
          if (_errs12) {
            vErrors.length = _errs12;
          } else {
            vErrors = null;
          }
        }
      }
    }
  } else {
    const err8 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err8];
    } else {
      vErrors.push(err8);
    }
    errors++;
  }
  validate200.errors = vErrors;
  return errors === 0;
}
validate200.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

function validate199(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="urn:druff:generated:FieldMappingDocument" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate199.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate200(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate200.errors : vErrors.concat(validate200.errors);
    errors = vErrors.length;
  }
  validate199.errors = vErrors;
  return errors === 0;
}
validate199.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

export const validateJoinKeyPair = validate204;
const schema149 = {
  $id: "urn:druff:generated:JoinKeyPairDocument",
  $ref: "urn:dander:control:contracts:v1:pipeline-graph#/$defs/JoinKeyPairDocument",
};

function validate204(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="urn:druff:generated:JoinKeyPairDocument" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate204.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.left === undefined) {
      const err0 = {
        instancePath,
        schemaPath:
          "urn:dander:control:contracts:v1:pipeline-graph#/$defs/JoinKeyPairDocument/required",
        keyword: "required",
        params: { missingProperty: "left" },
        message: "must have required property '" + "left" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.right === undefined) {
      const err1 = {
        instancePath,
        schemaPath:
          "urn:dander:control:contracts:v1:pipeline-graph#/$defs/JoinKeyPairDocument/required",
        keyword: "required",
        params: { missingProperty: "right" },
        message: "must have required property '" + "right" + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(key0 === "left" || key0 === "right")) {
        const err2 = {
          instancePath,
          schemaPath:
            "urn:dander:control:contracts:v1:pipeline-graph#/$defs/JoinKeyPairDocument/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.left !== undefined) {
      if (typeof data.left !== "string") {
        const err3 = {
          instancePath: instancePath + "/left",
          schemaPath:
            "urn:dander:control:contracts:v1:pipeline-graph#/$defs/JoinKeyPairDocument/properties/left/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.right !== undefined) {
      if (typeof data.right !== "string") {
        const err4 = {
          instancePath: instancePath + "/right",
          schemaPath:
            "urn:dander:control:contracts:v1:pipeline-graph#/$defs/JoinKeyPairDocument/properties/right/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
  } else {
    const err5 = {
      instancePath,
      schemaPath: "urn:dander:control:contracts:v1:pipeline-graph#/$defs/JoinKeyPairDocument/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err5];
    } else {
      vErrors.push(err5);
    }
    errors++;
  }
  validate204.errors = vErrors;
  return errors === 0;
}
validate204.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

export const validateJoin = validate205;
const schema151 = {
  $id: "urn:druff:generated:JoinDocument",
  $ref: "urn:dander:control:contracts:v1:pipeline-graph#/$defs/JoinDocument",
};

function validate206(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate206.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.type === undefined) {
      const err0 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "type" },
        message: "must have required property '" + "type" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.keys === undefined) {
      const err1 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "keys" },
        message: "must have required property '" + "keys" + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(key0 === "keys" || key0 === "metadata" || key0 === "type")) {
        const err2 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.keys !== undefined) {
      let data0 = data.keys;
      if (Array.isArray(data0)) {
        if (data0.length < 1) {
          const err3 = {
            instancePath: instancePath + "/keys",
            schemaPath: "#/properties/keys/minItems",
            keyword: "minItems",
            params: { limit: 1 },
            message: "must NOT have fewer than 1 items",
          };
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        }
        const len0 = data0.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data1 = data0[i0];
          if (data1 && typeof data1 == "object" && !Array.isArray(data1)) {
            if (data1.left === undefined) {
              const err4 = {
                instancePath: instancePath + "/keys/" + i0,
                schemaPath: "#/$defs/JoinKeyPairDocument/required",
                keyword: "required",
                params: { missingProperty: "left" },
                message: "must have required property '" + "left" + "'",
              };
              if (vErrors === null) {
                vErrors = [err4];
              } else {
                vErrors.push(err4);
              }
              errors++;
            }
            if (data1.right === undefined) {
              const err5 = {
                instancePath: instancePath + "/keys/" + i0,
                schemaPath: "#/$defs/JoinKeyPairDocument/required",
                keyword: "required",
                params: { missingProperty: "right" },
                message: "must have required property '" + "right" + "'",
              };
              if (vErrors === null) {
                vErrors = [err5];
              } else {
                vErrors.push(err5);
              }
              errors++;
            }
            for (const key1 in data1) {
              if (!(key1 === "left" || key1 === "right")) {
                const err6 = {
                  instancePath: instancePath + "/keys/" + i0,
                  schemaPath: "#/$defs/JoinKeyPairDocument/additionalProperties",
                  keyword: "additionalProperties",
                  params: { additionalProperty: key1 },
                  message: "must NOT have additional properties",
                };
                if (vErrors === null) {
                  vErrors = [err6];
                } else {
                  vErrors.push(err6);
                }
                errors++;
              }
            }
            if (data1.left !== undefined) {
              if (typeof data1.left !== "string") {
                const err7 = {
                  instancePath: instancePath + "/keys/" + i0 + "/left",
                  schemaPath: "#/$defs/JoinKeyPairDocument/properties/left/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string",
                };
                if (vErrors === null) {
                  vErrors = [err7];
                } else {
                  vErrors.push(err7);
                }
                errors++;
              }
            }
            if (data1.right !== undefined) {
              if (typeof data1.right !== "string") {
                const err8 = {
                  instancePath: instancePath + "/keys/" + i0 + "/right",
                  schemaPath: "#/$defs/JoinKeyPairDocument/properties/right/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string",
                };
                if (vErrors === null) {
                  vErrors = [err8];
                } else {
                  vErrors.push(err8);
                }
                errors++;
              }
            }
          } else {
            const err9 = {
              instancePath: instancePath + "/keys/" + i0,
              schemaPath: "#/$defs/JoinKeyPairDocument/type",
              keyword: "type",
              params: { type: "object" },
              message: "must be object",
            };
            if (vErrors === null) {
              vErrors = [err9];
            } else {
              vErrors.push(err9);
            }
            errors++;
          }
        }
      } else {
        const err10 = {
          instancePath: instancePath + "/keys",
          schemaPath: "#/properties/keys/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array",
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.metadata !== undefined) {
      if (
        !validate43(data.metadata, {
          instancePath: instancePath + "/metadata",
          parentData: data,
          parentDataProperty: "metadata",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate43.errors : vErrors.concat(validate43.errors);
        errors = vErrors.length;
      }
    }
    if (data.type !== undefined) {
      let data5 = data.type;
      if (typeof data5 !== "string") {
        const err11 = {
          instancePath: instancePath + "/type",
          schemaPath: "#/properties/type/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
      if (!(data5 === "inner" || data5 === "left" || data5 === "right" || data5 === "full")) {
        const err12 = {
          instancePath: instancePath + "/type",
          schemaPath: "#/properties/type/enum",
          keyword: "enum",
          params: { allowedValues: schema59.properties.type.enum },
          message: "must be equal to one of the allowed values",
        };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      }
    }
  } else {
    const err13 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err13];
    } else {
      vErrors.push(err13);
    }
    errors++;
  }
  validate206.errors = vErrors;
  return errors === 0;
}
validate206.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

function validate205(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="urn:druff:generated:JoinDocument" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate205.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate206(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate206.errors : vErrors.concat(validate206.errors);
    errors = vErrors.length;
  }
  validate205.errors = vErrors;
  return errors === 0;
}
validate205.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

export const validatePipelineEdge = validate209;
const schema154 = {
  $id: "urn:druff:generated:EdgeDocument",
  $ref: "urn:dander:control:contracts:v1:pipeline-graph#/$defs/EdgeDocument",
};

function validate210(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate210.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.from === undefined) {
      const err0 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "from" },
        message: "must have required property '" + "from" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.to === undefined) {
      const err1 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "to" },
        message: "must have required property '" + "to" + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(
        key0 === "from" ||
        key0 === "join" ||
        key0 === "mappings" ||
        key0 === "metadata" ||
        key0 === "to"
      )) {
        const err2 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.from !== undefined) {
      if (typeof data.from !== "string") {
        const err3 = {
          instancePath: instancePath + "/from",
          schemaPath: "#/properties/from/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.join !== undefined) {
      let data1 = data.join;
      const _errs5 = errors;
      let valid1 = false;
      const _errs6 = errors;
      if (
        !validate42(data1, {
          instancePath: instancePath + "/join",
          parentData: data,
          parentDataProperty: "join",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate42.errors : vErrors.concat(validate42.errors);
        errors = vErrors.length;
      }
      var _valid0 = _errs6 === errors;
      valid1 = valid1 || _valid0;
      const _errs7 = errors;
      if (data1 !== null) {
        const err4 = {
          instancePath: instancePath + "/join",
          schemaPath: "#/properties/join/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
      var _valid0 = _errs7 === errors;
      valid1 = valid1 || _valid0;
      if (!valid1) {
        const err5 = {
          instancePath: instancePath + "/join",
          schemaPath: "#/properties/join/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      } else {
        errors = _errs5;
        if (vErrors !== null) {
          if (_errs5) {
            vErrors.length = _errs5;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.mappings !== undefined) {
      let data2 = data.mappings;
      if (Array.isArray(data2)) {
        const len0 = data2.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (
            !validate46(data2[i0], {
              instancePath: instancePath + "/mappings/" + i0,
              parentData: data2,
              parentDataProperty: i0,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err6 = {
          instancePath: instancePath + "/mappings",
          schemaPath: "#/properties/mappings/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array",
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.metadata !== undefined) {
      if (
        !validate43(data.metadata, {
          instancePath: instancePath + "/metadata",
          parentData: data,
          parentDataProperty: "metadata",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate43.errors : vErrors.concat(validate43.errors);
        errors = vErrors.length;
      }
    }
    if (data.to !== undefined) {
      if (typeof data.to !== "string") {
        const err7 = {
          instancePath: instancePath + "/to",
          schemaPath: "#/properties/to/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
  } else {
    const err8 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err8];
    } else {
      vErrors.push(err8);
    }
    errors++;
  }
  validate210.errors = vErrors;
  return errors === 0;
}
validate210.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

function validate209(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="urn:druff:generated:EdgeDocument" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate209.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate210(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate210.errors : vErrors.concat(validate210.errors);
    errors = vErrors.length;
  }
  validate209.errors = vErrors;
  return errors === 0;
}
validate209.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

export const validateTrigger = validate215;
const schema156 = {
  $id: "urn:druff:generated:TriggerDocument",
  $ref: "urn:dander:control:contracts:v1:pipeline-graph#/$defs/TriggerDocument",
};

function validate216(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate216.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  const _errs0 = errors;
  let valid0 = false;
  const _errs1 = errors;
  if (
    !validate96(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate96.errors : vErrors.concat(validate96.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = true;
  }
  const _errs2 = errors;
  if (
    !validate99(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate99.errors : vErrors.concat(validate99.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = true;
    }
  }
  const _errs3 = errors;
  if (
    !validate102(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate102.errors : vErrors.concat(validate102.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs3 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = true;
    }
  }
  if (!valid0) {
    const err0 = {
      instancePath,
      schemaPath: "#/anyOf",
      keyword: "anyOf",
      params: {},
      message: "must match a schema in anyOf",
    };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate216.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate216.evaluated = { dynamicProps: true, dynamicItems: false };

function validate215(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="urn:druff:generated:TriggerDocument" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate215.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate216(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate216.errors : vErrors.concat(validate216.errors);
    errors = vErrors.length;
  } else {
    var props0 = validate216.evaluated.props;
  }
  validate215.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate215.evaluated = { dynamicProps: true, dynamicItems: false };

export const validateDestination = validate221;
const schema158 = {
  $id: "urn:druff:generated:DestinationDocument",
  $ref: "urn:dander:control:contracts:v1:pipeline-graph#/$defs/DestinationDocument",
};

function validate221(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="urn:druff:generated:DestinationDocument" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate221.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.dataset === undefined) {
      const err0 = {
        instancePath,
        schemaPath:
          "urn:dander:control:contracts:v1:pipeline-graph#/$defs/DestinationDocument/required",
        keyword: "required",
        params: { missingProperty: "dataset" },
        message: "must have required property '" + "dataset" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.table === undefined) {
      const err1 = {
        instancePath,
        schemaPath:
          "urn:dander:control:contracts:v1:pipeline-graph#/$defs/DestinationDocument/required",
        keyword: "required",
        params: { missingProperty: "table" },
        message: "must have required property '" + "table" + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(
        key0 === "business_key" ||
        key0 === "dataset" ||
        key0 === "project" ||
        key0 === "table"
      )) {
        const err2 = {
          instancePath,
          schemaPath:
            "urn:dander:control:contracts:v1:pipeline-graph#/$defs/DestinationDocument/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.business_key !== undefined) {
      let data0 = data.business_key;
      if (Array.isArray(data0)) {
        const len0 = data0.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (typeof data0[i0] !== "string") {
            const err3 = {
              instancePath: instancePath + "/business_key/" + i0,
              schemaPath:
                "urn:dander:control:contracts:v1:pipeline-graph#/$defs/DestinationDocument/properties/business_key/items/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string",
            };
            if (vErrors === null) {
              vErrors = [err3];
            } else {
              vErrors.push(err3);
            }
            errors++;
          }
        }
      } else {
        const err4 = {
          instancePath: instancePath + "/business_key",
          schemaPath:
            "urn:dander:control:contracts:v1:pipeline-graph#/$defs/DestinationDocument/properties/business_key/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array",
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.dataset !== undefined) {
      let data2 = data.dataset;
      if (typeof data2 === "string") {
        if (func1(data2) < 1) {
          const err5 = {
            instancePath: instancePath + "/dataset",
            schemaPath:
              "urn:dander:control:contracts:v1:pipeline-graph#/$defs/DestinationDocument/properties/dataset/minLength",
            keyword: "minLength",
            params: { limit: 1 },
            message: "must NOT have fewer than 1 characters",
          };
          if (vErrors === null) {
            vErrors = [err5];
          } else {
            vErrors.push(err5);
          }
          errors++;
        }
      } else {
        const err6 = {
          instancePath: instancePath + "/dataset",
          schemaPath:
            "urn:dander:control:contracts:v1:pipeline-graph#/$defs/DestinationDocument/properties/dataset/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.project !== undefined) {
      let data3 = data.project;
      const _errs10 = errors;
      let valid4 = false;
      const _errs11 = errors;
      if (typeof data3 !== "string") {
        const err7 = {
          instancePath: instancePath + "/project",
          schemaPath:
            "urn:dander:control:contracts:v1:pipeline-graph#/$defs/DestinationDocument/properties/project/anyOf/0/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
      var _valid0 = _errs11 === errors;
      valid4 = valid4 || _valid0;
      const _errs13 = errors;
      if (data3 !== null) {
        const err8 = {
          instancePath: instancePath + "/project",
          schemaPath:
            "urn:dander:control:contracts:v1:pipeline-graph#/$defs/DestinationDocument/properties/project/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
      var _valid0 = _errs13 === errors;
      valid4 = valid4 || _valid0;
      if (!valid4) {
        const err9 = {
          instancePath: instancePath + "/project",
          schemaPath:
            "urn:dander:control:contracts:v1:pipeline-graph#/$defs/DestinationDocument/properties/project/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      } else {
        errors = _errs10;
        if (vErrors !== null) {
          if (_errs10) {
            vErrors.length = _errs10;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.table !== undefined) {
      let data4 = data.table;
      if (typeof data4 === "string") {
        if (func1(data4) < 1) {
          const err10 = {
            instancePath: instancePath + "/table",
            schemaPath:
              "urn:dander:control:contracts:v1:pipeline-graph#/$defs/DestinationDocument/properties/table/minLength",
            keyword: "minLength",
            params: { limit: 1 },
            message: "must NOT have fewer than 1 characters",
          };
          if (vErrors === null) {
            vErrors = [err10];
          } else {
            vErrors.push(err10);
          }
          errors++;
        }
      } else {
        const err11 = {
          instancePath: instancePath + "/table",
          schemaPath:
            "urn:dander:control:contracts:v1:pipeline-graph#/$defs/DestinationDocument/properties/table/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
  } else {
    const err12 = {
      instancePath,
      schemaPath: "urn:dander:control:contracts:v1:pipeline-graph#/$defs/DestinationDocument/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err12];
    } else {
      vErrors.push(err12);
    }
    errors++;
  }
  validate221.errors = vErrors;
  return errors === 0;
}
validate221.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

export const validatePartitioning = validate222;
const schema160 = {
  $id: "urn:druff:generated:PartitioningDocument",
  $ref: "urn:dander:control:contracts:v1:pipeline-graph#/$defs/PartitioningDocument",
};

function validate223(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate223.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    for (const key0 in data) {
      if (!(key0 === "field" || key0 === "granularity" || key0 === "require_partition_filter")) {
        const err0 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
    if (data.field !== undefined) {
      let data0 = data.field;
      const _errs3 = errors;
      let valid1 = false;
      const _errs4 = errors;
      if (typeof data0 !== "string") {
        const err1 = {
          instancePath: instancePath + "/field",
          schemaPath: "#/properties/field/anyOf/0/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
      var _valid0 = _errs4 === errors;
      valid1 = valid1 || _valid0;
      const _errs6 = errors;
      if (data0 !== null) {
        const err2 = {
          instancePath: instancePath + "/field",
          schemaPath: "#/properties/field/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
      var _valid0 = _errs6 === errors;
      valid1 = valid1 || _valid0;
      if (!valid1) {
        const err3 = {
          instancePath: instancePath + "/field",
          schemaPath: "#/properties/field/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      } else {
        errors = _errs3;
        if (vErrors !== null) {
          if (_errs3) {
            vErrors.length = _errs3;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.granularity !== undefined) {
      let data1 = data.granularity;
      if (typeof data1 !== "string") {
        const err4 = {
          instancePath: instancePath + "/granularity",
          schemaPath: "#/$defs/PartitioningType/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
      if (!(data1 === "hour" || data1 === "day" || data1 === "month" || data1 === "year")) {
        const err5 = {
          instancePath: instancePath + "/granularity",
          schemaPath: "#/$defs/PartitioningType/enum",
          keyword: "enum",
          params: { allowedValues: schema121.enum },
          message: "must be equal to one of the allowed values",
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.require_partition_filter !== undefined) {
      if (typeof data.require_partition_filter !== "boolean") {
        const err6 = {
          instancePath: instancePath + "/require_partition_filter",
          schemaPath: "#/properties/require_partition_filter/type",
          keyword: "type",
          params: { type: "boolean" },
          message: "must be boolean",
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
  } else {
    const err7 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err7];
    } else {
      vErrors.push(err7);
    }
    errors++;
  }
  validate223.errors = vErrors;
  return errors === 0;
}
validate223.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

function validate222(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="urn:druff:generated:PartitioningDocument" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate222.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate223(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate223.errors : vErrors.concat(validate223.errors);
    errors = vErrors.length;
  }
  validate222.errors = vErrors;
  return errors === 0;
}
validate222.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

export const validateWriter = validate225;
const schema163 = {
  $id: "urn:druff:generated:WriterDocument",
  $ref: "urn:dander:control:contracts:v1:pipeline-graph#/$defs/WriterDocument",
};

function validate226(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate226.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.write_mode === undefined) {
      const err0 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "write_mode" },
        message: "must have required property '" + "write_mode" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.destination === undefined) {
      const err1 = {
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "destination" },
        message: "must have required property '" + "destination" + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(
        key0 === "clustering" ||
        key0 === "cursor_field" ||
        key0 === "destination" ||
        key0 === "max_batch_rows" ||
        key0 === "partitioning" ||
        key0 === "schema_evolution" ||
        key0 === "transport" ||
        key0 === "write_mode"
      )) {
        const err2 = {
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 },
          message: "must NOT have additional properties",
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.clustering !== undefined) {
      let data0 = data.clustering;
      if (Array.isArray(data0)) {
        if (data0.length > 4) {
          const err3 = {
            instancePath: instancePath + "/clustering",
            schemaPath: "#/properties/clustering/maxItems",
            keyword: "maxItems",
            params: { limit: 4 },
            message: "must NOT have more than 4 items",
          };
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        }
        const len0 = data0.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (typeof data0[i0] !== "string") {
            const err4 = {
              instancePath: instancePath + "/clustering/" + i0,
              schemaPath: "#/properties/clustering/items/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string",
            };
            if (vErrors === null) {
              vErrors = [err4];
            } else {
              vErrors.push(err4);
            }
            errors++;
          }
        }
      } else {
        const err5 = {
          instancePath: instancePath + "/clustering",
          schemaPath: "#/properties/clustering/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array",
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.cursor_field !== undefined) {
      let data2 = data.cursor_field;
      const _errs7 = errors;
      let valid3 = false;
      const _errs8 = errors;
      if (typeof data2 !== "string") {
        const err6 = {
          instancePath: instancePath + "/cursor_field",
          schemaPath: "#/properties/cursor_field/anyOf/0/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
      var _valid0 = _errs8 === errors;
      valid3 = valid3 || _valid0;
      const _errs10 = errors;
      if (data2 !== null) {
        const err7 = {
          instancePath: instancePath + "/cursor_field",
          schemaPath: "#/properties/cursor_field/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
      var _valid0 = _errs10 === errors;
      valid3 = valid3 || _valid0;
      if (!valid3) {
        const err8 = {
          instancePath: instancePath + "/cursor_field",
          schemaPath: "#/properties/cursor_field/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      } else {
        errors = _errs7;
        if (vErrors !== null) {
          if (_errs7) {
            vErrors.length = _errs7;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.destination !== undefined) {
      let data3 = data.destination;
      if (data3 && typeof data3 == "object" && !Array.isArray(data3)) {
        if (data3.dataset === undefined) {
          const err9 = {
            instancePath: instancePath + "/destination",
            schemaPath: "#/$defs/DestinationDocument/required",
            keyword: "required",
            params: { missingProperty: "dataset" },
            message: "must have required property '" + "dataset" + "'",
          };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
        if (data3.table === undefined) {
          const err10 = {
            instancePath: instancePath + "/destination",
            schemaPath: "#/$defs/DestinationDocument/required",
            keyword: "required",
            params: { missingProperty: "table" },
            message: "must have required property '" + "table" + "'",
          };
          if (vErrors === null) {
            vErrors = [err10];
          } else {
            vErrors.push(err10);
          }
          errors++;
        }
        for (const key1 in data3) {
          if (!(
            key1 === "business_key" ||
            key1 === "dataset" ||
            key1 === "project" ||
            key1 === "table"
          )) {
            const err11 = {
              instancePath: instancePath + "/destination",
              schemaPath: "#/$defs/DestinationDocument/additionalProperties",
              keyword: "additionalProperties",
              params: { additionalProperty: key1 },
              message: "must NOT have additional properties",
            };
            if (vErrors === null) {
              vErrors = [err11];
            } else {
              vErrors.push(err11);
            }
            errors++;
          }
        }
        if (data3.business_key !== undefined) {
          let data4 = data3.business_key;
          if (Array.isArray(data4)) {
            const len1 = data4.length;
            for (let i1 = 0; i1 < len1; i1++) {
              if (typeof data4[i1] !== "string") {
                const err12 = {
                  instancePath: instancePath + "/destination/business_key/" + i1,
                  schemaPath: "#/$defs/DestinationDocument/properties/business_key/items/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string",
                };
                if (vErrors === null) {
                  vErrors = [err12];
                } else {
                  vErrors.push(err12);
                }
                errors++;
              }
            }
          } else {
            const err13 = {
              instancePath: instancePath + "/destination/business_key",
              schemaPath: "#/$defs/DestinationDocument/properties/business_key/type",
              keyword: "type",
              params: { type: "array" },
              message: "must be array",
            };
            if (vErrors === null) {
              vErrors = [err13];
            } else {
              vErrors.push(err13);
            }
            errors++;
          }
        }
        if (data3.dataset !== undefined) {
          let data6 = data3.dataset;
          if (typeof data6 === "string") {
            if (func1(data6) < 1) {
              const err14 = {
                instancePath: instancePath + "/destination/dataset",
                schemaPath: "#/$defs/DestinationDocument/properties/dataset/minLength",
                keyword: "minLength",
                params: { limit: 1 },
                message: "must NOT have fewer than 1 characters",
              };
              if (vErrors === null) {
                vErrors = [err14];
              } else {
                vErrors.push(err14);
              }
              errors++;
            }
          } else {
            const err15 = {
              instancePath: instancePath + "/destination/dataset",
              schemaPath: "#/$defs/DestinationDocument/properties/dataset/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string",
            };
            if (vErrors === null) {
              vErrors = [err15];
            } else {
              vErrors.push(err15);
            }
            errors++;
          }
        }
        if (data3.project !== undefined) {
          let data7 = data3.project;
          const _errs23 = errors;
          let valid8 = false;
          const _errs24 = errors;
          if (typeof data7 !== "string") {
            const err16 = {
              instancePath: instancePath + "/destination/project",
              schemaPath: "#/$defs/DestinationDocument/properties/project/anyOf/0/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string",
            };
            if (vErrors === null) {
              vErrors = [err16];
            } else {
              vErrors.push(err16);
            }
            errors++;
          }
          var _valid1 = _errs24 === errors;
          valid8 = valid8 || _valid1;
          const _errs26 = errors;
          if (data7 !== null) {
            const err17 = {
              instancePath: instancePath + "/destination/project",
              schemaPath: "#/$defs/DestinationDocument/properties/project/anyOf/1/type",
              keyword: "type",
              params: { type: "null" },
              message: "must be null",
            };
            if (vErrors === null) {
              vErrors = [err17];
            } else {
              vErrors.push(err17);
            }
            errors++;
          }
          var _valid1 = _errs26 === errors;
          valid8 = valid8 || _valid1;
          if (!valid8) {
            const err18 = {
              instancePath: instancePath + "/destination/project",
              schemaPath: "#/$defs/DestinationDocument/properties/project/anyOf",
              keyword: "anyOf",
              params: {},
              message: "must match a schema in anyOf",
            };
            if (vErrors === null) {
              vErrors = [err18];
            } else {
              vErrors.push(err18);
            }
            errors++;
          } else {
            errors = _errs23;
            if (vErrors !== null) {
              if (_errs23) {
                vErrors.length = _errs23;
              } else {
                vErrors = null;
              }
            }
          }
        }
        if (data3.table !== undefined) {
          let data8 = data3.table;
          if (typeof data8 === "string") {
            if (func1(data8) < 1) {
              const err19 = {
                instancePath: instancePath + "/destination/table",
                schemaPath: "#/$defs/DestinationDocument/properties/table/minLength",
                keyword: "minLength",
                params: { limit: 1 },
                message: "must NOT have fewer than 1 characters",
              };
              if (vErrors === null) {
                vErrors = [err19];
              } else {
                vErrors.push(err19);
              }
              errors++;
            }
          } else {
            const err20 = {
              instancePath: instancePath + "/destination/table",
              schemaPath: "#/$defs/DestinationDocument/properties/table/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string",
            };
            if (vErrors === null) {
              vErrors = [err20];
            } else {
              vErrors.push(err20);
            }
            errors++;
          }
        }
      } else {
        const err21 = {
          instancePath: instancePath + "/destination",
          schemaPath: "#/$defs/DestinationDocument/type",
          keyword: "type",
          params: { type: "object" },
          message: "must be object",
        };
        if (vErrors === null) {
          vErrors = [err21];
        } else {
          vErrors.push(err21);
        }
        errors++;
      }
    }
    if (data.max_batch_rows !== undefined) {
      let data9 = data.max_batch_rows;
      if (!(typeof data9 == "number" && !(data9 % 1) && !isNaN(data9) && isFinite(data9))) {
        const err22 = {
          instancePath: instancePath + "/max_batch_rows",
          schemaPath: "#/properties/max_batch_rows/type",
          keyword: "type",
          params: { type: "integer" },
          message: "must be integer",
        };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
      if (typeof data9 == "number" && isFinite(data9)) {
        if (data9 > 100000 || isNaN(data9)) {
          const err23 = {
            instancePath: instancePath + "/max_batch_rows",
            schemaPath: "#/properties/max_batch_rows/maximum",
            keyword: "maximum",
            params: { comparison: "<=", limit: 100000 },
            message: "must be <= 100000",
          };
          if (vErrors === null) {
            vErrors = [err23];
          } else {
            vErrors.push(err23);
          }
          errors++;
        }
        if (data9 <= 0 || isNaN(data9)) {
          const err24 = {
            instancePath: instancePath + "/max_batch_rows",
            schemaPath: "#/properties/max_batch_rows/exclusiveMinimum",
            keyword: "exclusiveMinimum",
            params: { comparison: ">", limit: 0 },
            message: "must be > 0",
          };
          if (vErrors === null) {
            vErrors = [err24];
          } else {
            vErrors.push(err24);
          }
          errors++;
        }
      }
    }
    if (data.partitioning !== undefined) {
      let data10 = data.partitioning;
      const _errs33 = errors;
      let valid9 = false;
      const _errs34 = errors;
      if (
        !validate141(data10, {
          instancePath: instancePath + "/partitioning",
          parentData: data,
          parentDataProperty: "partitioning",
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate141.errors : vErrors.concat(validate141.errors);
        errors = vErrors.length;
      }
      var _valid2 = _errs34 === errors;
      valid9 = valid9 || _valid2;
      const _errs35 = errors;
      if (data10 !== null) {
        const err25 = {
          instancePath: instancePath + "/partitioning",
          schemaPath: "#/properties/partitioning/anyOf/1/type",
          keyword: "type",
          params: { type: "null" },
          message: "must be null",
        };
        if (vErrors === null) {
          vErrors = [err25];
        } else {
          vErrors.push(err25);
        }
        errors++;
      }
      var _valid2 = _errs35 === errors;
      valid9 = valid9 || _valid2;
      if (!valid9) {
        const err26 = {
          instancePath: instancePath + "/partitioning",
          schemaPath: "#/properties/partitioning/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf",
        };
        if (vErrors === null) {
          vErrors = [err26];
        } else {
          vErrors.push(err26);
        }
        errors++;
      } else {
        errors = _errs33;
        if (vErrors !== null) {
          if (_errs33) {
            vErrors.length = _errs33;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.schema_evolution !== undefined) {
      let data11 = data.schema_evolution;
      if (typeof data11 !== "string") {
        const err27 = {
          instancePath: instancePath + "/schema_evolution",
          schemaPath: "#/$defs/SchemaEvolution/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err27];
        } else {
          vErrors.push(err27);
        }
        errors++;
      }
      if (!(data11 === "strict" || data11 === "additive")) {
        const err28 = {
          instancePath: instancePath + "/schema_evolution",
          schemaPath: "#/$defs/SchemaEvolution/enum",
          keyword: "enum",
          params: { allowedValues: schema122.enum },
          message: "must be equal to one of the allowed values",
        };
        if (vErrors === null) {
          vErrors = [err28];
        } else {
          vErrors.push(err28);
        }
        errors++;
      }
    }
    if (data.transport !== undefined) {
      let data12 = data.transport;
      if (typeof data12 !== "string") {
        const err29 = {
          instancePath: instancePath + "/transport",
          schemaPath: "#/properties/transport/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err29];
        } else {
          vErrors.push(err29);
        }
        errors++;
      }
      if (!(data12 === "load_job" || data12 === "storage_write" || data12 === "copy")) {
        const err30 = {
          instancePath: instancePath + "/transport",
          schemaPath: "#/properties/transport/enum",
          keyword: "enum",
          params: { allowedValues: schema118.properties.transport.enum },
          message: "must be equal to one of the allowed values",
        };
        if (vErrors === null) {
          vErrors = [err30];
        } else {
          vErrors.push(err30);
        }
        errors++;
      }
    }
    if (data.write_mode !== undefined) {
      let data13 = data.write_mode;
      if (typeof data13 !== "string") {
        const err31 = {
          instancePath: instancePath + "/write_mode",
          schemaPath: "#/$defs/WriteMode/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string",
        };
        if (vErrors === null) {
          vErrors = [err31];
        } else {
          vErrors.push(err31);
        }
        errors++;
      }
      if (!(
        data13 === "scd1" ||
        data13 === "scd2" ||
        data13 === "snapshot" ||
        data13 === "incremental" ||
        data13 === "replace"
      )) {
        const err32 = {
          instancePath: instancePath + "/write_mode",
          schemaPath: "#/$defs/WriteMode/enum",
          keyword: "enum",
          params: { allowedValues: schema123.enum },
          message: "must be equal to one of the allowed values",
        };
        if (vErrors === null) {
          vErrors = [err32];
        } else {
          vErrors.push(err32);
        }
        errors++;
      }
    }
  } else {
    const err33 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object",
    };
    if (vErrors === null) {
      vErrors = [err33];
    } else {
      vErrors.push(err33);
    }
    errors++;
  }
  validate226.errors = vErrors;
  return errors === 0;
}
validate226.evaluated = { props: true, dynamicProps: false, dynamicItems: false };

function validate225(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="urn:druff:generated:WriterDocument" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate225.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate226(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate226.errors : vErrors.concat(validate226.errors);
    errors = vErrors.length;
  }
  validate225.errors = vErrors;
  return errors === 0;
}
validate225.evaluated = { props: true, dynamicProps: false, dynamicItems: false };
